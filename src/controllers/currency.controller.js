/* eslint-disable camelcase */
const sequelizeQuery = require('sequelize-query');
const rp = require('request-promise');
const cron = require('node-cron');
const db = require('../config/db.config');
const cryptoCur = require('../config/crypto.config');
const fiatCur = require('../config/fiat.config');

const queryParser = sequelizeQuery(db);
const Currency = db.currencies;
const Log = db.logs;
const Setting = db.settings;

exports.getAllCurrencies = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Currency.findAll({
      ...query,
    });
    const count = await Currency.count({
      ...query,
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getCurrencyList = async (req, res) => {
  try {
    const cryptoCurMapped = cryptoCur.map((crypto) => ({ ...crypto, crypto: true }));
    const fiatCurMapped = fiatCur.map((fiat) => ({ ...fiat, crypto: false }));
    return res.json([...cryptoCurMapped, ...fiatCurMapped]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getCurrencyById = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Currency.findByPk(id, {
      ...query,
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const currencyRatesFetcher = async () => {
  const data = await Currency.findAll();
  const currencyApi = await Setting.findOne({ where: { value: 'freecurrencyapi' } });
  const filteredDataCrypto = data.filter((coin) => (coin.ratefromApi && coin.crypto));
  const filteredDataFiat = data.filter((coin) => (coin.ratefromApi && !coin.crypto));
  const apiData = await rp({
    uri: 'https://api.coingecko.com/api/v3/coins',
    json: true,
    gzip: true,
  });
  const fiatData = await rp({
    uri: `https://freecurrencyapi.net/api/v2/latest?apikey=${currencyApi.param1}`,
    json: true,
    gzip: true,
  });
  filteredDataCrypto.forEach(async (coin) => {
    const updatedRate = apiData.find((rate) => rate.symbol === coin.symbol.toLowerCase());
    if (updatedRate) {
      await Currency.update({
        // eslint-disable-next-line max-len
        rateUsd: updatedRate.market_data.current_price.usd,
        metadata: JSON.stringify(updatedRate),
      }, { where: { id: coin.id } });
    }
  });
  filteredDataFiat.forEach(async (coin) => {
    const updatedRate = fiatData.data[coin.symbol.toUpperCase()];
    if (updatedRate) {
      await Currency.update({
        rateUsd: updatedRate,
      }, { where: { id: coin.id } });
    } else {
      await Currency.update({
        rateUsd: 1,
      }, { where: { id: coin.id } });
    }
  });
};

cron.schedule('0 */1 * * *', async () => {
  await currencyRatesFetcher();
});

exports.fetchCurrencyRates = async (req, res) => {
  try {
    await currencyRatesFetcher();
    await Log.create({ message: `Admin #${req.user.id} fetched currency rates` });
    return res.json({ message: 'امتیاز ثبت شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createCurrency = async (req, res) => {
  try {
    const {
      name, symbol, rateUsd, active, rateFromApi, crypto,
    } = req.body;
    const currency = await Currency.findOne({ where: { symbol } });
    if (currency) {
      return res.status(400).json({
        message: 'این ارز وجود دارد',
      });
    }
    const data = await Currency.create({
      name,
      symbol,
      icon: req.file ? req.file.filename : undefined,
      rateUsd,
      active,
      rateFromApi,
      crypto,
    });
    currencyRatesFetcher();
    await Log.create({ message: `Admin #${req.user.id} created currency #${data.id}` });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateCurrency = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      name,
      symbol,
      rateUsd,
      active,
      rateFromApi,
      crypto,
    } = req.body;

    const currency = await Currency.findOne({ where: { id } });
    if (!currency) {
      return res.status(400).json({
        message: 'ارز یافت نشد',
      });
    }

    const num = await Currency.update({
      name,
      symbol,
      icon: req.file ? req.file.filename : undefined,
      rateUsd,
      active,
      rateFromApi,
      crypto,
    }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      await Log.create({ message: `Admin ${req.user.id} updated currency #${id}` });
      return res.json({ message: 'ارز بروزرسانی شد' });
    }
    return res.status(500).json({ message: 'آپدیت ارز انجام نشد!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteCurrency = async (req, res) => {
  const { id } = req.params;

  try {
    const num = await Currency.destroy({ where: { id } });
    const ifDeleted = parseInt(num, 10);
    if (ifDeleted === 1) {
      await Log.create({ message: `Admin ${req.user.id} deleted currency #${id}` });
      return res.json({ message: 'ارز با موفقیت حذف شد' });
    }
    return res.status(500).json({ message: 'نمی توان این ارز را حذف کرد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
