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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  Media.associate = (models) => {
    Media.belongsTo(models.Organization, { foreignKey: 'org_id' })
  }

  return Media
}

module.exports = media
