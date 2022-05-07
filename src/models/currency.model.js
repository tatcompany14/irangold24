const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Currency = sequelize.define('currency', {
    name: {
      type: DataTypes.STRING,
    },
    symbol: {
      type: DataTypes.STRING,
    },
    icon: {
      type: DataTypes.STRING,
    },
    rateUsd: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.00,
    },
    ratefromApi: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    crypto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.TEXT,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
  return Currency;
};
