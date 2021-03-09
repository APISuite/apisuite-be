const { idpProviders } = require('../util/enums')

const ssoClient = (sequelize, DataTypes) => {
  return sequelize.define('sso_clients', {
    provider: {
      type: DataTypes.ENUM(...Object.values(idpProviders)),
      primaryKey: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    clientSecret: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    clientData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = ssoClient
