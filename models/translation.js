const translation = (sequelize, DataTypes) => {
  return sequelize.define('translations', {
    locale: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    translations: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = translation
