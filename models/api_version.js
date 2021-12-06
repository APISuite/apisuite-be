const apiVersion = (sequelize, DataTypes) => {
  const APIVersion = sequelize.define('apiVersions', {
    apiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    spec: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    specFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    live: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deprecated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'api_versions',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  APIVersion.associate = (models) => {
    APIVersion.belongsTo(models.Api)
    APIVersion.hasMany(models.ApiVersionRoute)
  }

  return APIVersion
}

module.exports = apiVersion
