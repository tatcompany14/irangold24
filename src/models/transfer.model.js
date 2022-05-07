const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transfer = sequelize.define('transfer', {
    type: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.FLOAT,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    trxId: {
      type: DataTypes.STRING,
    },
  });
  return Transfer;
};
