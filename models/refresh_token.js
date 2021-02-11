const refreshToken = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('refresh_tokens', {
    token: {
      type: DataTypes.TEXT,
      primaryKey: true,
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
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  })

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User)
  }

  RefreshToken.findByUserToken = (_token, userID) => {
    return RefreshToken.findOne({
      where: {
        token: _token,
        userID,
      },
    })
  }

  return RefreshToken
}

module.exports = refreshToken
