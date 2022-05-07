const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Request = sequelize.define('request', {
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    trxId: {
      type: DataTypes.STRING,
    },
    customer: {
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
  return Request;
};
