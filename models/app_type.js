const appType = (sequelize, DataTypes) => {
  const AppType = sequelize.define('app_type', {
    appId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
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
