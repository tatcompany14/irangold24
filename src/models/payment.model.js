const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('payment', {
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    trxId: {
      type: DataTypes.STRING,
    },
    merchant: {
      type: DataTypes.STRING,
    },
    merchantId: {
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
  return Payment;
};
