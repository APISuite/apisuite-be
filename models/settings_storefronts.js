
const settingsStorefronts = (sequelize, DataTypes) => {
  return sequelize.define('settings_storefronts', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    values: {
      type: DataTypes.JSON,
    },
  },
  {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
}
module.exports = settingsStorefronts
