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
    parent: {
      type: DataTypes.TEXT,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    online: {
      type: DataTypes.BOOLEAN,
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
