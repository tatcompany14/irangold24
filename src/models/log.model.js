const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Log = sequelize.define('log', {
    message: {
      type: DataTypes.TEXT,
    },
  });
  return Log;
};
