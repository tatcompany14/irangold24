const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('transaction', {
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    customerName: {
      type: DataTypes.STRING,
    },
    customerMail: {
      type: DataTypes.STRING,
    },
    trxId: {
      type: DataTypes.STRING,
      unique: true,
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
  return Transaction;
};
