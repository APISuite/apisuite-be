const media = (sequelize, DataTypes) => {
  const Media = sequelize.define('media', {
    file: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orgId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  return Media
}

module.exports = media
