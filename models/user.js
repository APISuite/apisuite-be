const bcrypt = require('bcrypt')
const { addFindAllPaginated } = require('../util/pagination')

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    oidcId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oidcProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastPasswordChange: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  User.associate = (models) => {
    User.hasMany(models.RefreshToken)
  }

  const hashPassword = async function (userObj) {
    if (userObj.changed('password')) {
      userObj.password = await bcrypt.hash(userObj.password, 10)
    }
  }

  User.beforeCreate(hashPassword)
  User.beforeUpdate(hashPassword)

  User.findByLogin = (login) => {
    return User.findOne({
      where: { email: sequelize.fn('lower', login) },
    })
  }

  User.findByOIDC = (id, provider, transaction) => {
    return User.findOne({
      where: {
        oidcId: id,
        oidcProvider: provider,
      },
      transaction,
    })
  }

  User.findByActivationToken = (token) => {
    return User.findOne({
      where: { activationToken: token },
    })
  }

  User.findAllPaginated = addFindAllPaginated(User)

  User.prototype.checkPassword = function (pwd) {
    return bcrypt.compare(pwd, this.password)
  }

  User.prototype.toProfileJSON = function () {
    return {
      name: this.name,
      bio: this.bio,
      avatar: this.avatar,
      mobile: this.mobile,
    }
  }

  return User
}

module.exports = user
