const AppSubscription = (sequelize, DataTypes) => {
  const AppSubscription = sequelize.define('app_subscriptions', {
    app_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'app',
        key: 'id',
      },
    },
    api_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'api',
        key: 'id',
      },
    },
  }, {
    indexes: [
      { unique: true, fields: ['app_id', 'api_id'] },
    ],
    timestamp: true,
    underscored: true,
    freezeTableName: true,
  })

  AppSubscription.associate = (models) => {
    AppSubscription.belongsTo(models.App, { foreignKey: 'app_id', as: 'App' })
    AppSubscription.belongsTo(models.Api, { foreignKey: 'api_id', as: 'Api' })
  }

  return AppSubscription
}

module.exports = AppSubscription
