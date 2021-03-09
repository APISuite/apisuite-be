const functions = (sequelize, DataTypes) => {
  return sequelize.define('functions', {
    microservice_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ms_service_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    ms_host_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = functions
