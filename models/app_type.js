const appType = (sequelize, DataTypes) => {
  const AppType = sequelize.define('appType', {
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'app_types',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  AppType.associate = (models) => {
    AppType.hasMany(models.App, { foreignKey: 'app_type_id' })
  }

  return AppType
}

module.exports = appType
