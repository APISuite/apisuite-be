const passwordRecovery = (sequelize, DataTypes) => {
  const PasswordRecovery = sequelize.define('password_recovery', {
    token: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  PasswordRecovery.associate = (models) => {
    PasswordRecovery.belongsTo(models.User)
  }

  PasswordRecovery.findByToken = (_token) => {
    return PasswordRecovery.findOne({
      where: { token: _token },
    })
  }

  PasswordRecovery.findLatest = (userID) => {
    return PasswordRecovery.findOne({
      where: { user_id: userID },
      order: [['created_at', 'DESC']],
    })
  }

  return PasswordRecovery
}

module.exports = passwordRecovery
