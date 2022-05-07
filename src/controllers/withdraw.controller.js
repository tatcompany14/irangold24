/* eslint-disable camelcase */
const sequelizeQuery = require('sequelize-query');
const db = require('../config/db.config');
const mailer = require('../utils/mailer');

const queryParser = sequelizeQuery(db);
const Withdraw = db.withdraws;
const User = db.users;
const Log = db.logs;
const Wallet = db.wallets;
const Linked = db.linkeds;
const Method = db.methods;

const { addBalance, removeBalance } = require('../utils/wallet');

exports.getAllWithdraws = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Withdraw.findAll({
      ...query,
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] },
      }],
    });
    const count = await Withdraw.count({
      ...query,
      where: {
        ...query.where,
      },
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getWithdrawById = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Withdraw.findByPk(id, {
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

exports.getWithdrawByIdAdmin = async (req, res) => {
  const { id } = req.params;
  const query = await queryParser.parse(req);
  try {
    const data = await Withdraw.findByPk(id, {
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

exports.getAllWithdrawsByUser = async (req, res) => {
  const { id } = req.user;
  const query = await queryParser.parse(req);
  try {
    const data = await Withdraw.findAll({
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
    const count = await Withdraw.count({
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

exports.createWithdraw = async (req, res) => {
  const { id } = req.user;
  const { methodId, amount, currency } = req.body;
  try {
    const user = await User.findByPk(id);
    const wallet = await Wallet.findOne({ where: { currency, userId: id } });
    const method = await Method.findByPk(methodId);
    const linkedAcc = await Linked.findOne({ where: { methodId, userId: id } });

    let percentageCharge = 0;

    if (!user.kyc) {
      return res.status(403).json({ message: 'Please verify KYC to debit from account' });
    }

    if (!wallet || (wallet.balance < amount)) {
      return res.status(400).json({
        message: 'Insufficient balance',
      });
    }

    if (method.minAmount > amount) {
      return res.status(400).json({
        message: `Minimum withdrawal is ${method.minAmount} ${method.currency}`,
      });
    }
    if (method.maxAmount < amount) {
      return res.status(400).json({
        message: `Maximum withdrawal is ${method.minAmount} ${method.currency}`,
      });
    }

    if (!linkedAcc) {
      return res.status(400).json({
        message: `شما باید ابتدا از طریق لینک به این حساب وصل شوید`,
      });
    }

    if (method.percentageCharge) {
      percentageCharge = amount * (method.percentageCharge / 100);
    }

    const fee = percentageCharge + method.fixedCharge;

    const calculateAmount = amount - fee;

    const data = await Withdraw.create({
      method: method.name,
      params: linkedAcc.params,
      amount,
      currency,
      fee,
      total: calculateAmount,
      userId: id,
    });
    await Log.create({ message: `User #${id} requested withdrawal of ${amount} ${currency}` });
    await removeBalance(amount, currency, id);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.acceptWithdraw = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Withdraw.findByPk(id);
    const num = await Withdraw.update({ status: 'success', params: data.params }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      mailer({
        user: data.userId,
        subject: ` برداشت ${data.id} تایید شد `,
        message: ` برداشت ${data.total} ${data.currency} تایید و به  ${data.method} ارسال شد `,
      });
      await Log.create({ message: `Admin #${req.user.id} accepted withdrawal #${id}` });
      return res.json({ message: 'برداشت تایید شد' });
    }
    return res.status(500).json({ message: 'خطای سیستمی' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.declineWithdraw = async (req, res) => {
  const { id } = req.params;
  try {
    const dataWithdraw = await Withdraw.findByPk(id);
    const num = await Withdraw.update({ status: 'failed', params: dataWithdraw.params }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      const data = await Withdraw.findByPk(id);
      await addBalance(data.amount, data.currency, data.userId);
      mailer({
        user: data.userId,
        subject: ` برداشت ${data.id} رد شد `,
        message: ` برداشت ${data.total} ${data.currency} رد شد و موجودی به کیف پول شما برگشت داده شد `,
      });
      await Log.create({ message: `Admin #${req.user.id} declined withdrawal #${id}` });
      return res.json({ message: 'برداشت برگشت زده شد' });
    }
    return res.status(500).json({ message: 'خطای سیستمی' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
