/* eslint-disable camelcase */
const sequelizeQuery = require('sequelize-query');
const db = require('../config/db.config');
const mailer = require('../utils/mailer');

const queryParser = sequelizeQuery(db);
const Deposit = db.deposits;
const User = db.users;
const Log = db.logs;

const { molliePayment } = require('../utils/payments/mollie');
const { coinbasePayment } = require('../utils/payments/coinbase');
const { coinPayments } = require('../utils/payments/coinpayments');
const { paypalPayment } = require('../utils/payments/paypal');
const { addBalance } = require('../utils/wallet');
const { stripePayment } = require('../utils/payments/stripe');
const { coingatePayment } = require('../utils/payments/coingate');
const { paystackPayment } = require('../utils/payments/paystack');
const { voguePayment } = require('../utils/payments/voguepay');

exports.getAllDeposits = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Deposit.findAll({
      ...query,
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] },
      }],
    });
    const count = await Deposit.count({
      ...query,
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getDepositById = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Deposit.findByPk(id, {
      ...query,
      where: {
        userId: req.user.id,
        ...query.where,
      },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] },
      }],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getDepositByIdAdmin = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Deposit.findByPk(id, {
      ...query,
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] },
      }],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllDepositsByUser = async (req, res) => {
  const { id } = req.user;
  const query = await queryParser.parse(req);
  try {
    const data = await Deposit.findAll({
      ...query,
      where: {
        userId: id,
        ...query.where,
      },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] },
      }],
    });
    const count = await Deposit.count({
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

exports.createDeposit = async (req, res) => {
  const { id } = req.user;
  const { payment_method, amount, currency } = req.body;
  const user = await User.findByPk(id);
  try {
    let returnedObj;

    const data = await Deposit.create({
      payment_method,
      amount,
      userId: id,
      currency,
    });

    if (payment_method === 'mollie') {
      const payment = await molliePayment(amount, data.id, currency);
      // eslint-disable-next-line no-underscore-dangle
      returnedObj = { ...data.dataValues, redirect: payment._links.checkout.href };
    } else if (payment_method === 'coinbase') {
      const payment = await coinbasePayment(amount, data.id, currency);
      returnedObj = { ...data.dataValues, redirect: payment.hosted_url };
    } else if (payment_method === 'paypal') {
      const payment = await paypalPayment(amount, data.id, currency);
      returnedObj = { ...data.dataValues, redirect: payment };
    } else if (payment_method === 'stripe') {
      const payment = await stripePayment(amount, data.id, currency.toLowerCase());
      returnedObj = { ...data.dataValues, redirect: payment };
    } else if (payment_method === 'coinpayments') {
      const payment = await coinPayments({ symbol: currency, amount, id: data.id }, user);
      returnedObj = { ...data.dataValues, redirect: payment.checkout_url };
    } else if (payment_method === 'coingate') {
      const payment = await coingatePayment(amount, data.id, currency);
      returnedObj = { ...data.dataValues, redirect: payment };
    } else if (payment_method === 'paystack') {
      const payment = await paystackPayment(data, user);
      returnedObj = { ...data.dataValues, redirect: payment };
    } else if (payment_method === 'voguepay') {
      const payment = await voguePayment(data, user);
      returnedObj = { ...data.dataValues, redirect: payment };
    }

    await Log.create({ message: `User #${id} requested deposit of ${amount} ${currency} via ${payment_method}` });
    return res.json(returnedObj);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.acceptDeposit = async (req, res) => {
  const { id } = req.params;
  try {
    const num = await Deposit.update({ status: 'success' }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      const data = await Deposit.findByPk(id);
      await addBalance(data.amount, data.currency, data.userId);
      await Log.create({ message: `Admin #${req.user.id} accepted deposit #${id}` });
      mailer({
        user: data.userId,
        subject: 'واریز انجام شد',
        message: `واریز  ${data.amount} ${data.currency} با موفقیت انجام شد `,
      });
      return res.json({ message: 'واریز با موفقیت انجام شد' });
    }
    return res.status(500).json({ message: 'نمی توان واریز را ثبت کرد!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.declineDeposit = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Deposit.findByPk(id);
    const num = await Deposit.update({ status: 'failed' }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      await Log.create({ message: `Admin #${req.user.id} declined deposit #${id}` });
      return res.json({ message: 'واریز ناموفق بود' });
    }
    mailer({
      user: data.userId,
      subject: 'واریز انجام نشد!',
      message: `واریز ${data.amount} ${data.currency} شما رد شد `,
    });
    return res.status(500).json({ message: 'نمی توان واریز را انجام داد!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
