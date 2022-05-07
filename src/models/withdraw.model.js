const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Withdraw = sequelize.define('withdraw', {
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    method: {
      type: DataTypes.STRING,
    },
    params: {
      type: DataTypes.TEXT,
      get() {
        return JSON.parse(this.getDataValue('params'));
      },
      set(value) {
        this.setDataValue('params', JSON.stringify(value));
      },
    },
    currency: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.DOUBLE,
    },
    fee: {
      type: DataTypes.DOUBLE,
    },
    total: {
      type: DataTypes.DOUBLE,
    },
  });
  return Withdraw;
};
