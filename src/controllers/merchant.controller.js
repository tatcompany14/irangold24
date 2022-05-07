const sequelizeQuery = require('sequelize-query');
const { customAlphabet } = require('nanoid');
const db = require('../config/db.config');

const queryParser = sequelizeQuery(db);
const Merchant = db.merchants;
const User = db.users;

exports.getAllMerchants = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Merchant.findAll({
      ...query,
      include: ['user'],
      where: {
        ...query.where,
      },
    });
    const count = await Merchant.count({
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

exports.getMerchantById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Merchant.findByPk(id, {
      include: ['user'],
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.createMerchant = async (req, res) => {
  const nanoId = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
  const merId = nanoId();
  const { userId } = req.body;
  try {
    const data = await Merchant.create({ merId, ...req.body });
    await User.update({ role: 2 }, { where: { id: userId } });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateMerchant = async (req, res) => {
  const { id } = req.user;

  try {
    const updateObj = {
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
    };
    const num = await Merchant.update(updateObj, { where: { userId: id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'کد مرچنت بروزرسانی شد' });
    }
    return res.status(500).json({ message: 'نمی توان کد مرچنت را بروزرسانی کرد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.updateMerchantAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const updateObj = {
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      status: req.body.status,
    };
    const num = await Merchant.update(updateObj, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'کد مرچنت بروزرسانی شد' });
    }
    return res.status(500).json({ message: 'نمی توان کد مرچنت را بروزرسانی کرد' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteMerchant = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Merchant.findByPk(id);
    const num = await Merchant.destroy({ where: { id } });
    User.update({ role: 1 }, { where: { id: data.userId } });
    const ifDeleted = parseInt(num, 10);
    if (ifDeleted === 1) {
      return res.json({ message: `کاربر با این ایدی حذف شد id=${id}` });
    }
    return res.status(500).json({ message: `نمی توان این کاربر را حذف کرد id=${id}` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
