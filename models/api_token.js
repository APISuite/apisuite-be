const bcrypt = require('bcrypt')

const apiToken = (sequelize, DataTypes) => {
  const APIToken = sequelize.define('api_tokens', {
    token: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
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

  APIToken.associate = (models) => {
    APIToken.belongsTo(models.User)
  }

  const hashToken = async function (apiTokenObj) {
    if (apiTokenObj.changed('token')) {
      apiTokenObj.token = await bcrypt.hash(apiTokenObj.token, 10)
    }
  }

  APIToken.beforeCreate(hashToken)
  APIToken.beforeUpdate(hashToken)

  APIToken.prototype.checkToken = function (token) {
    return bcrypt.compare(token, this.token)
  }

  return APIToken
}

module.exports = apiToken
