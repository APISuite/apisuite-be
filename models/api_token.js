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

  return APIToken
}

module.exports = apiToken
