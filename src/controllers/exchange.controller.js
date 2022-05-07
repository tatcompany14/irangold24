/* eslint-disable camelcase */
const sequelizeQuery = require('sequelize-query');
const db = require('../config/db.config');
const mailer = require('../utils/mailer');

const queryParser = sequelizeQuery(db);
const Exchange = db.exchanges;
const Log = db.logs;
const Setting = db.settings;
const Currency = db.currencies;
const Wallet = db.wallets;

const { addBalance, removeBalance } = require('../utils/wallet');

exports.getAllExchanges = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Exchange.findAll({
      ...query,
      include: ['user'],
    });
    const count = await Exchange.count({
      ...query,
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getExchangeById = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Exchange.findByPk(id, {
      ...query,
      where: {
        userId: req.user.id,
        ...query.where,
      },
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getExchangeByIdAdmin = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Exchange.findByPk(id, {
      ...query,
      include: ['user'],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllExchangesByUser = async (req, res) => {
  const { id } = req.user;
  const query = await queryParser.parse(req);
  try {
    const data = await Exchange.findAll({
      ...query,
      where: {
        userId: id,
        ...query.where,
      },
    });
    const count = await Exchange.count({
      ...query,
      where: {
        userId: id,
        ...query.where,
      },
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createExchange = async (req, res) => {
  const { id } = req.user;
  const { from, to, amountFrom } = req.body;
  try {
    const currencyFrom = await Currency.findOne({ where: { symbol: from } });
    const currencyTo = await Currency.findOne({ where: { symbol: to } });
    const fromPriceUsd = currencyFrom.rateUsd;
    const toPriceUsd = currencyTo.rateUsd;
    const cryptoCondition = currencyTo.crypto || currencyFrom.crypto;
    const exchangeRate = cryptoCondition ? fromPriceUsd / toPriceUsd : toPriceUsd / fromPriceUsd;
    const adjustments = await Setting.findOne({ where: { value: 'adjustments' } });
    const amountTo = amountFrom * exchangeRate;
    const fee = amountTo * (parseFloat(adjustments.param1, 10) / 100);
    const total = amountTo - fee;

    const wallet = await Wallet.findOne({ where: { userId: id, currency: from } });
    if (!wallet || (wallet.balance < amountFrom)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    await removeBalance(amountFrom, from, id);
    const data = await Exchange.create({
      userId: id,
      from,
      to,
      exchangeRate,
      amountFrom,
      amountTo,
      fee,
      total,
    });

    await Log.create({ message: `User #${id} requested exchange of ${amountFrom} ${from} to ${amountTo} ${to}` });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.acceptExchange = async (req, res) => {
  const { id } = req.params;
  try {
    const exchange = await Exchange.findOne({ where: { id } });
    const num = await Exchange.update({ status: 'success' }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      await addBalance(exchange.total, exchange.to, exchange.userId);
      await Log.create({ message: `Admin #${req.user.id} accepted Exchange #${id}` });
      return res.json({ message: 'تبدیل با موفقیت انجام شد' });
    }
    mailer({
      user: exchange.userId,
      subject: 'تبدیل پذیرفته شد',
      message: `در خواست تبدیل ${exchange.amountFrom} ${exchange.from} به  ${exchange.total} ${exchange.to} با موفقیت انجام شد `,
    });

    return res.status(500).json({ message: 'نمی توان تبدیل را انجام داد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.declineExchange = async (req, res) => {
  const { id } = req.params;
  try {
    const exchange = await Exchange.findOne({ where: { id } });
    const num = await Exchange.update({ status: 'failed' }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      await addBalance(exchange.amountFrom, exchange.from, exchange.userId);
      await Log.create({ message: `Admin #${req.user.id} declined Exchange #${exchange.id}` });
      return res.json({ message: 'تبدیل انجام نشد' });
    }
    mailer({
      user: exchange.userId,
      subject: 'تبدیل رد شد',
      message: `در خواست تبدیل  #${exchange.id} رد شد `,
    });

    return res.status(500).json({ message: 'نمی توان تبدیل را انجام داد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
