const translation = (sequelize, DataTypes) => {
  const Translation = sequelize.define('translations', {
    locale: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    translations: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    extension: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  })

  Translation.findByLanguageExtension = async (locale, extension) => {
    const resources = await Translation.findAll({
      where: {
        locale: locale,
        extension: extension,
      },
    })
    if (resources.length) {
      return resources[0]
    }
  }
  return Translation
}

module.exports = translation
