const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Linked = sequelize.define('linked', {
    params: {
      type: DataTypes.TEXT,
      get() {
        return JSON.parse(this.getDataValue('params'));
      },
      set(value) {
        this.setDataValue('params', JSON.stringify(value));
      },
    },
  });
  return Linked;
};
