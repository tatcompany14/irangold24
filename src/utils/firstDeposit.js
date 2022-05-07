/* eslint-disable camelcase */
const db = require('../config/db.config');
const mailer = require('./mailer');
const { addBalance } = require('./wallet');

const Deposit = db.deposits;
const User = db.users;
const Log = db.logs;
const Setting = db.settings;

exports.firstDeposit = async (id) => {
  const data = await Deposit.findByPk(id);
  const user = await User.findByPk(data.userId);
  const firstDeposit = await Deposit.findAll({ where: { userId: data.userId } });

  const refferal = await Setting.findOne({ where: { value: 'refferal' } });
  if (firstDeposit.length === 1) {
    const referData = await User.findOne({ where: { id: user.refferedBy } });
    if (referData) {
      addBalance(refferal.param1, refferal.param2, referData.id);
      await Log.create({ message: `User #${referData.id} rewarded ${refferal.param1} ${refferal.param2} for reffering User #${data.userId}` });
    }
    mailer({
      user: referData.id,
      subject: 'پاداش ارجاعی دریافت شد',
      message: ` شما ${refferal.param1} ${refferal.param2}  پاداش بابت کاربر ${data.userId} دریافت کردید `,
    });
  }
};
