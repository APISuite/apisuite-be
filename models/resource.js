const resource = (sequelize, DataTypes) => {
  const Resource = sequelize.define('resource', {
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
    namespace: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      default: 'en-US',
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })
  Resource.findByNamespace = async (orgId, namespace, language) => {
    const resources = await Resource.findAll({
      where: {
        orgId: orgId,
        namespace: namespace,
        language: language || 'en-US',
      },
      attributes: ['url'],
    })
    if (resources.length) {
      return resources[0]
    }
    if (language) {
      return Resource.findByNamespace(orgId, namespace, undefined)
    } else {
      return null
    }

  }
  return Resource
}

module.exports = resource
