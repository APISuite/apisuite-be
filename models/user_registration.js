const userRegistration = (sequelize, DataTypes) => {
  return sequelize.define('user_registration', {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organizationWebsite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = userRegistration
