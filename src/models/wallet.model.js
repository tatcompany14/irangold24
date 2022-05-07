const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define('wallet', {
    balance: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    currency: {
      type: DataTypes.STRING,
    },
  });
  return Wallet;
};
