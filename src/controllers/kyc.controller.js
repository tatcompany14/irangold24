const sequelizeQuery = require('sequelize-query');
const db = require('../config/db.config');

const queryParser = sequelizeQuery(db);

const User = db.users;
const Kyc = db.kycs;

exports.getAllKyc = async (req, res) => {
  const query = await queryParser.parse(req);
  try {
    const data = await Kyc.findAll({
      ...query,
      include: ['user'],
    });
    const count = await Kyc.count({
      ...query,
    });
    return res.json({ count, data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getKycByUser = async (req, res) => {
  try {
    const data = await Kyc.findOne({
      where: { userId: req.user.id },
    });
    if (data) {
      return res.json(data);
    }
    return res.json({ message: 'هنوز ارسال نشده است' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
exports.getKycByUserId = async (req, res) => {
  try {
    const data = await Kyc.findOne({
      where: { userId: req.params.id },
      include: ['user'],
    });
    if (data) {
      return res.json(data);
    }
    return res.json({ message: 'هنوز ارسال نشده است' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
exports.createKyc = async (req, res) => {
  try {
    await Kyc.create({
      type: req.body.type,
      front: req.files.front ? req.files.front[0].filename : undefined,
      back: req.files.back ? req.files.back[0].filename : undefined,
      selfie: req.files.selfie ? req.files.selfie[0].filename : undefined,
      status: 'submitted',
      userId: req.user.id,
    });
    return res.json({ message: 'KYC ثبت شد' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
exports.resubmitKyc = async (req, res) => {
  try {
    await Kyc.destroy({
      where: { userId: req.user.id },
    });
    return res.json({ message: 'شما اکنون می توانید KYC را ثبت کنید' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
exports.acceptKyc = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Kyc.findByPk(id);
    await User.update({ kyc: true }, { where: { id: data.userId } });
    const num = await Kyc.update({ status: 'accepted' }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'KYC ثبت شد' });
    }
    return res.status(500).json({ message: 'نمی توان ثبت کرد KYC' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.declineKyc = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Kyc.findByPk(id);
    await User.update({ kyc: false }, { where: { id: data.userId } });
    const num = await Kyc.update({ status: 'declined' }, { where: { id } });
    const ifUpdated = parseInt(num, 10);
    if (ifUpdated === 1) {
      return res.json({ message: 'KYC ثبت نشد' });
    }
    return res.status(500).json({ message: 'نمی توان ثبت کرد KYC' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
