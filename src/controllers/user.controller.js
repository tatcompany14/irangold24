const sequelizeQuery = require('sequelize-query');
const db = require('../config/db.config');

const queryParser = sequelizeQuery(db);
const User = db.users;

exports.getAllUsers = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await User.findAll({
      ...query,
      where: {
        ...query.where,
      },
      attributes: { exclude: ['password'] },
    });
    const count = await User.count({
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

exports.getUserDetails = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await User.findByPk(id, {
      attributes: {
        exclude: ['password'],
      },
      include: ['merchant'],
    });
    const referCount = await User.count({ where: { refferedBy: id } });
    return res.json({ ...data.dataValues, referCount });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: ['merchant'],
    });
    const referCount = await User.count({ where: { refferedBy: id } });
    return res.json({ ...data.dataValues, referCount });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const data = await User.count({
      where: {
        role: 1,
      },
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUserAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const updateObj = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      password: req.body.password,
      role: req.body.role,
      active: req.body.active,
      kyc: req.body.kyc,
      passUpdate: req.body.password ? Math.floor(Date.now() / 1000) : undefined,
    };
    const num = await User.update(updateObj, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'عملیات با موفقیت انجام شد' });
    }
    return res.status(500).json({ message: 'عملیات ناموفق بود' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.user;

  try {
    const updateObj = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      password: req.body.password,
      passUpdate: req.body.password ? Math.floor(Date.now() / 1000) : undefined,
    };
    const num = await User.update(updateObj, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'عملیات با موفقیت انجام شد' });
    }
    return res.status(500).json({ message: 'عملیات ناموفق بود' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const num = await User.destroy({ where: { id } });
    const ifDeleted = parseInt(num, 10);
    if (ifDeleted === 1) {
      return res.json({ message: `کاربر با مشخصات زیر حذف شد id=${id}` });
    }
    return res.status(500).json({ message: `نمی توان کاربر زیر را حذف کرد id=${id}` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
