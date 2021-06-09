const appMetadata = (sequelize, DataTypes) => {
  const AppMetadata = sequelize.define('app_metadata', {
    appId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'app_metadata',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  })

  AppMetadata.associate = (models) => {
    AppMetadata.belongsTo(models.App)
  }

  return AppMetadata
}

module.exports = appMetadata
