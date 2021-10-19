const { addFindAllPaginated } = require('../util/pagination')
const crypto = require('../util/crypto')
const { idpProviders, appStates } = require('../util/enums')

const app = (sequelize, DataTypes) => {
  const App = sequelize.define('app', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    redirect_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING,
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'private',
    },
    logo: {
      type: DataTypes.STRING,
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientSecret: {
      type: DataTypes.TEXT,
      allowNull: true,
      get () {
        return this.getDataValue('clientSecret') ? crypto.decipher(this.getDataValue('clientSecret')) : null
      },
      set (secret) {
        this.setDataValue('clientSecret', secret ? crypto.cipher(secret) : null)
      },
    },
    client_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    org_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'organization',
        key: 'id',
      },
    },
    idpProvider: {
      type: DataTypes.ENUM(...Object.values(idpProviders)),
      defaultValue: idpProviders.INTERNAL,
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM(...Object.values(appStates)),
      defaultValue: appStates.DRAFT,
      allowNull: false,
    },
    tosUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    privacyUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtubeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supportUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    directUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    labels: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  App.associate = (models) => {
    App.hasMany(models.AppMetadata, { as: 'metadata' })
    App.belongsTo(models.Organization, { foreignKey: 'org_id' })
    App.belongsToMany(models.Api, { as: 'subscriptions', through: models.AppSubscription, foreignKey: 'app_id' })
  }

  App.findAllPaginated = addFindAllPaginated(App)

  App.findByClientID = (clientID) => {
    return App.findOne({
      where: {
        clientId: clientID,
      },
    })
  }

  return App
}

module.exports = app
