
const settingsStorefronts = (sequelize, DataTypes) => {
  const SettingsStoreFronts = sequelize.define('settings_storefronts', {
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
  return SettingsStoreFronts
}
module.exports = settingsStorefronts
