const apiVersionRoute = (sequelize, DataTypes) => {
  const APIVersionRoute = sequelize.define('api_version_routes', {
    apiVersionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  APIVersionRoute.associate = (models) => {
    APIVersionRoute.belongsTo(models.ApiVersion)
  }

  return APIVersionRoute
}

module.exports = apiVersionRoute
