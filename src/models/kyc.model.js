const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Kyc = sequelize.define('kyc', {
    type: {
      type: DataTypes.STRING,
    },
    front: {
      type: DataTypes.STRING,
    },
    back: {
      type: DataTypes.STRING,
    },
    selfie: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
  });
  return Kyc;
};
