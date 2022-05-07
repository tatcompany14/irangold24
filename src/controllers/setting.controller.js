/* eslint-disable camelcase */
const sequelizeQuery = require('sequelize-query');
const { Op } = require('sequelize');
const db = require('../config/db.config');
const fieldData = require('../config/gateway.config');
const { Last7Days, getDay } = require('../utils/dates');
const mailer = require('../utils/mailer');
const { addBalance, removeBalance } = require('../utils/wallet');

const queryParser = sequelizeQuery(db);

const Setting = db.settings;
const Gateway = db.gateways;
const Log = db.logs;
const User = db.users;
const Deposit = db.deposits;
const Withdraw = db.withdraws;
const Exchange = db.exchanges;
const Buy = db.buys;
const Sell = db.sells;

exports.getLogs = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Log.findAll({
      ...query,
    });
    const count = await Log.count({
      ...query,
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getSettings = async (req, res) => {
  try {
    const logo = await Setting.findOne({ where: { value: 'logo' } });
    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });
    const apiUrl = await Setting.findOne({ where: { value: 'apiUrl' } });
    const site = await Setting.findOne({ where: { value: 'site' } });
    const refferal = await Setting.findOne({ where: { value: 'refferal' } });
    const adjustments = await Setting.findOne({ where: { value: 'adjustments' } });
    const tawk = await Setting.findOne({ where: { value: 'tawk' } });
    const freecurrencyapi = await Setting.findOne({ where: { value: 'freecurrencyapi' } });
    return res.json({
      logo,
      appUrl,
      apiUrl,
      site,
      refferal,
      adjustments,
      tawk,
      freecurrencyapi,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getSettingByValue = async (req, res) => {
  try {
    const data = await Setting.findOne({ where: { value: req.params.value } });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateGeneral = async (req, res) => {
  const {
    appUrl, apiUrl, siteName, siteEmail,
  } = req.body;
  try {
    const AppUrldataExists = await Setting.findOne({ where: { value: 'appUrl' } });
    if (AppUrldataExists) {
      await Setting.update({ param1: appUrl }, { where: { value: 'appUrl' } });
    } else {
      await Setting.create({ value: 'appUrl', param1: appUrl });
    }

    const apiUrlDataExists = await Setting.findOne({ where: { value: 'apiUrl' } });
    if (apiUrlDataExists) {
      await Setting.update({ param1: apiUrl }, { where: { value: 'apiUrl' } });
    } else {
      await Setting.create({ value: 'apiUrl', param1: apiUrl });
    }

    const siteExists = await Setting.findOne({ where: { value: 'site' } });
    if (siteExists) {
      await Setting.update({ param1: siteName, param2: siteEmail }, { where: { value: 'site' } });
    } else {
      await Setting.create({ value: 'site', param1: siteName, param2: siteEmail });
    }
    return res.json({ message: 'تنظیمات بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateFees = async (req, res) => {
  const { withdraw_fee, withdraw_fee_type } = req.body;
  try {
    const withdrawFeeExists = await Setting.findOne({ where: { value: 'withdraw_fee' } });
    if (withdrawFeeExists) {
      await Setting.update({ param1: withdraw_fee, param2: withdraw_fee_type }, { where: { value: 'withdraw_fee' } });
    } else {
      await Setting.create({ value: 'withdraw_fee', param1: withdraw_fee, param2: withdraw_fee_type });
    }
    return res.json({ message: 'کارمزد بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateSettingByValue = async (req, res) => {
  const { param1, param2 } = req.body;
  const { value } = req.params;
  try {
    const exists = await Setting.findOne({ where: { value } });
    if (exists) {
      await Setting.update({ param1, param2 }, { where: { value } });
    } else {
      await Setting.create({ value, param1, param2 });
    }
    return res.json({ message: 'تنظیمات بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateAdjustments = async (req, res) => {
  const { buy, sell } = req.body;
  try {
    const refferalExists = await Setting.findOne({ where: { value: 'adjustments' } });
    if (refferalExists) {
      await Setting.update({ param1: buy, param2: sell }, { where: { value: 'adjustments' } });
    } else {
      await Setting.create({ value: 'adjustments', param1: buy, param2: sell });
    }
    return res.json({ message: 'تنظیمات به روز شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateRewards = async (req, res) => {
  const { amount, type } = req.body;
  try {
    const refferalExists = await Setting.findOne({ where: { value: 'refferal' } });
    if (refferalExists) {
      await Setting.update({ param1: amount, param2: type }, { where: { value: 'refferal' } });
    } else {
      await Setting.create({ value: 'refferal', param1: amount, param2: type });
    }
    return res.json({ message: 'جوایز بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateGateways = async (req, res) => {
  const { value } = req.params;
  try {
    const dataExists = await Gateway.findOne({ where: { value } });
    if (dataExists) {
      await Gateway.update({
        name: req.body.name,
        apiKey: req.body.apiKey,
        secretKey: req.body.secretKey,
        email: req.body.email,
        isCrypto: req.body.isCrypto,
        active: req.body.active,
        ex1: req.body.ex1,
        ex2: req.body.ex2,
      }, { where: { value } });
    } else {
      await Gateway.create({
        name: req.body.name,
        apiKey: req.body.apiKey,
        secretKey: req.body.secretKey,
        email: req.body.email,
        isCrypto: req.body.isCrypto,
        active: req.body.active,
        ex1: req.body.ex1,
        ex2: req.body.ex2,
      });
    }
    return res.json({ message: 'روش ها بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getGateways = async (req, res) => {
  try {
    const data = await Gateway.findAll({
      attributes: { exclude: ['apiKey', 'secretKey', 'email', 'ex1', 'ex2'] },
      where: { active: true, isExchangePayment: false },
      order: [['name', 'ASC']],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getGatewayCurrencies = async (req, res) => {
  try {
    return res.json(fieldData);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getGatewaysAdmin = async (req, res) => {
  try {
    const data = await Gateway.findAll();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getGatewayByValueAdmin = async (req, res) => {
  const { value } = req.params;
  try {
    const data = await Gateway.findOne({ where: { value } });
    return res.json({ fields: fieldData[value], data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getBasicInfo = async (req, res) => {
  try {
    const logo = await Setting.findOne({ where: { value: 'logo' } });
    const site = await Setting.findOne({ where: { value: 'site' } });
    const tagline = await Setting.findOne({ where: { value: 'tagline' } });
    const mainMenu = await Setting.findOne({ where: { value: 'mainmenu' } });
    const footerMenu = await Setting.findOne({ where: { value: 'footermenu' } });
    const services = await Setting.findOne({ where: { value: 'services' } });
    const solutions = await Setting.findOne({ where: { value: 'solutions' } });
    const work = await Setting.findOne({ where: { value: 'work' } });
    const faq = await Setting.findOne({ where: { value: 'faq' } });
    const apiUrl = await Setting.findOne({ where: { value: 'apiUrl' } });
    return res.json({
      logo,
      site,
      tagline,
      mainMenu,
      footerMenu,
      apiUrl,
      services,
      solutions,
      work,
      faq,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateMainMenu = async (req, res) => {
  try {
    await Setting.update(req.body, { where: { value: 'mainmenu' } });
    return res.json({ message: 'منو بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateFooterMenu = async (req, res) => {
  try {
    await Setting.update(req.body, { where: { value: 'footermenu' } });
    return res.json({ message: 'عملیات با موفقیت انجام شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateRepeater = async (req, res) => {
  try {
    await Setting.update(req.body, { where: { value: req.params.value } });
    return res.json({ message: 'عملیات با موفقیت انجام شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateLogoFav = async (req, res) => {
  try {
    await Setting.update({
      param1: req.files.logo ? req.files.logo[0].filename : undefined,
      param2: req.files.favicon ? req.files.favicon[0].filename : undefined,
    }, { where: { value: 'logo' } });
    return res.json({ message: 'عملیات با موفقیت انجام شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.balanceManage = async (req, res) => {
  try {
    const {
      userId, currency, amount, type,
    } = req.body;
    if (type === 'add') {
      await addBalance(amount, currency, userId);
    } else {
      await removeBalance(amount, currency, userId);
    }
    return res.json({ message: 'عملیات با موفقیت انجام شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const last7daysData = async (last7days, type) => {
  const getData = async (day) => {
    const query = {
      where: {
        createdAt: {
          [Op.lt]: getDay(day, 0),
          [Op.gt]: getDay(day, 1),
        },
        status: 'success',
      },
    };
    let data;
    if (type === 'deposit') {
      data = await Deposit.count(query);
    } else if (type === 'withdraw') {
      data = await Withdraw.count(query);
    } else {
      data = await Exchange.count(query);
    }
    return data;
  };

  const day1 = await getData(last7days[0]);
  const day2 = await getData(last7days[1]);
  const day3 = await getData(last7days[2]);
  const day4 = await getData(last7days[3]);
  const day5 = await getData(last7days[4]);
  const day6 = await getData(last7days[5]);
  const day7 = await getData(last7days[6]);

  return [day1, day2, day3, day4, day5, day6, day7];
};

exports.getDashboard = async (req, res) => {
  try {
    const last7days = Last7Days();
    const last7DaysExchanges = await last7daysData(last7days, 'exchange');
    const last7DaysDeposits = await last7daysData(last7days, 'deposit');
    const last7DaysWithdraws = await last7daysData(last7days, 'withdraw');
    const totalUsers = await User.count({
      where: { active: true, role: 1 },
    });
    const totalMerchants = await User.count({
      where: { active: true, role: 2 },
    });
    const totalDeposits = await Deposit.count({
      where: { status: 'success' },
    });
    const totalWithdrawn = await Withdraw.count({
      where: { status: 'success' },
    });
    const totalExchanges = await Exchange.count({
      where: { status: 'success' },
    });
    return res.json({
      totalUsers,
      totalMerchants,
      totalDeposits,
      totalWithdrawn,
      totalExchanges,
      labels: last7days,
      last7DaysExchanges,
      last7DaysDeposits,
      last7DaysWithdraws,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const last7daysDataUser = async (last7days, type, id) => {
  const getData = async (day) => {
    const query = {
      where: {
        createdAt: {
          [Op.lt]: getDay(day, 0),
          [Op.gt]: getDay(day, 1),
        },
      },
      userId: id,
    };
    let data;
    if (type === 'buy') {
      data = await Buy.count(query);
    } else {
      data = await Sell.count(query);
    }
    return data;
  };

  const day1 = await getData(last7days[0]);
  const day2 = await getData(last7days[1]);
  const day3 = await getData(last7days[2]);
  const day4 = await getData(last7days[3]);
  const day5 = await getData(last7days[4]);
  const day6 = await getData(last7days[5]);
  const day7 = await getData(last7days[6]);

  return [
    [Date.parse(last7days[0]), day1],
    [Date.parse(last7days[1]), day2],
    [Date.parse(last7days[2]), day3],
    [Date.parse(last7days[3]), day4],
    [Date.parse(last7days[4]), day5],
    [Date.parse(last7days[5]), day6],
    [Date.parse(last7days[6]), day7],
  ];
};

exports.getDashboardUser = async (req, res) => {
  const { id } = req.user;
  try {
    const last7days = Last7Days();
    const last7DaysBuys = await last7daysDataUser(last7days, 'buy', id);
    const last7DaysSells = await last7daysDataUser(last7days, 'sell', id);

    return res.json({
      labels: last7days,
      last7DaysBuys,
      last7DaysSells,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.handleImageUpload = async (req, res) => {
  try {
    if (req.file) {
      return res.json({
        file: req.file.filename,
        path: req.file.path,
      });
    }
    return res.status(400).json({ message: 'Upload Failed' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.sendUserEmail = async (req, res) => {
  try {
    mailer({
      user: req.body.userId,
      subject: req.body.subject,
      message: req.body.message,
    });
    return res.json({ message: 'عملیات با موفقیت انجام شد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
