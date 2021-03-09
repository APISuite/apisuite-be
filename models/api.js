const { addFindAllPaginated } = require('../util/pagination')
const { apiTypes } = require('../util/enums')

const api = (sequelize, DataTypes) => {
  const API = sequelize.define('apis', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseUri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baseUriSandbox: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    docs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(apiTypes)),
      defaultValue: apiTypes.CLOUD,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  API.associate = (models) => {
    API.hasMany(models.ApiVersion)
    API.belongsToMany(models.App, { as: 'subscriptions', through: models.AppSubscription, foreignKey: 'api_id' })
  }

  API.findAllPaginated = addFindAllPaginated(API)

  return API
}

module.exports = api
