const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Merchant = sequelize.define('merchant', {
    merId: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    proof: {
      type: DataTypes.STRING,
    },
  });
  return Merchant;
};
