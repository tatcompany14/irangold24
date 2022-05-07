const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pay = sequelize.define('pay', {
    status: {
      type: DataTypes.STRING,
      defaultValue: 'success',
    },
    trxId: {
      type: DataTypes.STRING,
    },
    merchant: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
  });
  return Pay;
};
