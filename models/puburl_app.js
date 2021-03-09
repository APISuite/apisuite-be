const puburlApp = (sequelize, DataTypes) => {
  const PubURLApp = sequelize.define('puburl_apps', {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('client', 'tos'),
      allowNull: false,
    },
    app_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'app',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    underscored: true,
  })

  PubURLApp.associate = (models) => {
    PubURLApp.belongsTo(models.App, { as: 'apps', foreignKey: 'app_id' })
  }

  return PubURLApp
}

module.exports = puburlApp
