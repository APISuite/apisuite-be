const page = (sequelize, DataTypes) => {
  return sequelize.define('pages', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    locale: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
}

module.exports = page
