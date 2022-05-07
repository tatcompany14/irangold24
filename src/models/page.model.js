const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Page = sequelize.define('page', {
    type: {
      type: DataTypes.STRING,
      defaultValue: 'landing',
    },
    name: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      get() {
        return JSON.parse(this.getDataValue('content'));
      },
      set(value) {
        this.setDataValue('content', JSON.stringify(value));
      },
    },
  });
  return Page;
};
