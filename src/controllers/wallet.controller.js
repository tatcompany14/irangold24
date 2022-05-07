const db = require('../config/db.config');

const Wallet = db.wallets;
const Currency = db.currencies;

exports.getWallet = async (req, res) => {
  try {
    const wallet = [];
    const data = await Wallet.findAll({ where: { userId: req.user.id } });
    const currencies = await Currency.findAll({ where: { active: true } });
    await currencies.forEach((item) => {
      const balance = data.find((x) => x.currency === item.symbol);
      wallet.push({ balance: balance ? balance : 0.00, currency: item.symbol, icon: item.icon });
    });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
exports.getWalletByUserId = async (req, res) => {
  try {
    const wallet = [];
    const data = await Wallet.findAll({ where: { userId: req.params.userId } });
    const currencies = await Currency.findAll({ where: { active: true } });
    await currencies.forEach((item) => {
      const balance = data.find((x) => x.currency === item.symbol);
      wallet.push({ balance: balance ? balance : 0.00, currency: item.symbol, icon: item.icon });
    });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
