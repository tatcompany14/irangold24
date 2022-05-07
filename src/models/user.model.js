const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    password: {
      type: DataTypes.STRING,
      set(val) {
        this.setDataValue('password', bcrypt.hashSync(val, 10));
      },
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    kyc: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refferedBy: {
      type: DataTypes.INTEGER,
    },
    reset: {
      type: DataTypes.STRING,
    },
    passUpdate: {
      type: DataTypes.INTEGER,
    },
  });
  return User;
};
