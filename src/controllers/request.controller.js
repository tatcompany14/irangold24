const sequelizeQuery = require('sequelize-query');
const { customAlphabet } = require('nanoid');
const db = require('../config/db.config');
const mailer = require('../utils/mailer');

const queryParser = sequelizeQuery(db);
const Request = db.requests;
const Merchant = db.merchants;
const Log = db.logs;
const Setting = db.settings;

exports.getAllRequests = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Request.findAll({
      ...query,
      include: ['merchant'],
    });
    const count = await Request.count({
      ...query,
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getAllRequestsByMerchant = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    const data = await Request.findAll({
      ...query,
      where: {
        ...query.where,
        merchantId: merchant.id,
      },
      include: ['merchant'],
    });
    const count = await Request.count({
      ...query,
      where: {
        ...query.where,
        merchantId: merchant.id,
      },
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getRequestById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Request.findByPk(id, {
      include: ['merchant'],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getRequestByTrxId = async (req, res) => {
  const { trxId } = req.params;
  try {
    const data = await Request.findOne({
      where: { trxId },
      include: ['merchant'],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.createRequest = async (req, res) => {
  const { id } = req.user;
  const { amount, currency, email } = req.body;

  try {
    const merchant = await Merchant.findOne({ where: { userId: id } });
    const nanoId = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);
    const trxId = nanoId();

    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });

    const data = await Request.create({
      amount,
      currency,
      customer: email,
      trxId,
      merchantId: merchant.id,
    });

    mailer({
      email,
      subject: `در خواست پرداخت  ${merchant.name}`,
      message: `Merchant: ${merchant.name} <br/>
      Amount: ${data.amount} ${data.currency} <br/>
      Payment Link: ${appUrl.param1}/checkout?trx=${data.trxId}`,
    });

    await Log.create({ message: `Merchant ${merchant.id} requested ${data.amount} ${data.currency} from ${email}` });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.deleteRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const num = await Request.destroy({ where: { id } });
    const ifDeleted = parseInt(num, 10);
    if (ifDeleted === 1) {
      return res.json({ message: 'درخواست حذف شد' });
    }
    return res.status(500).json({ message: 'خطای سیستمی !' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
