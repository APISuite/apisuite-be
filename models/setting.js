const { settingTypes } = require('../util/enums')

const setting = (sequelize, DataTypes) => {
  return sequelize.define('settings', {
    type: {
      type: DataTypes.ENUM(...Object.values(settingTypes)),
      allowNull: false,
      primaryKey: true,
    },
    values: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = setting
