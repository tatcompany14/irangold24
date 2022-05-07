const sequelizeQuery = require('sequelize-query');
const db = require('../config/db.config');

const queryParser = sequelizeQuery(db);

const Linked = db.linkeds;

exports.getUserLinkeds = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Linked.findAll({
      ...query,
      where: { userId: req.user.id },
      include: ['method'],
    });
    const count = await Linked.count({
      ...query,
      where: { userId: req.user.id },
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createLinked = async (req, res) => {
  try {
    const data = await Linked.create({ ...req.body, userId: req.user.id });
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.deleteLinked = async (req, res) => {
  const { id } = req.params;
  try {
    const num = await Linked.destroy({ where: { id, userId: req.user.id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'حساب پیوندی حذف شد' });
    }
    return res.status(500).json({ message: 'نمی توان حساب پیوندی را حذف کرد، با پشتیبانی تماس بگیرید' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
