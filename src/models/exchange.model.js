const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Exchange = sequelize.define('exchange', {
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    from: {
      type: DataTypes.STRING,
    },
    to: {
      type: DataTypes.STRING,
    },
    exchangeRate: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    amountFrom: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    amountTo: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    fee: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    total: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
  });
  return Exchange;
};
