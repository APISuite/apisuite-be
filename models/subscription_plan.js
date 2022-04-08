const plan = (sequelize, DataTypes) => {
  return sequelize.define('subscription_plan', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    plan: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = plan
