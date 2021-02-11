const role = (sequelize, DataTypes) => {
  return sequelize.define('role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    grants: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  }, {
    timestamp: true,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = role
