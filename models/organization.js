const { addFindAllPaginated } = require('../util/pagination')
const { publishEvent, routingKeys } = require('../services/msg-broker')

const organization = (sequelize, DataTypes) => {
  const Organization = sequelize.define('organization', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tosUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    privacyUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtubeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supportUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    taxExempt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  Organization.afterCreate((org, options) => {
    publishEvent(routingKeys.ORG_CREATED, {
      organization_id: org.id,
      meta: org,
    })
  })

  Organization.associate = (models) => {
    Organization.belongsTo(models.Address, { foreignKey: 'addressId' })
    Organization.hasMany(models.App, { foreignKey: 'org_id' })
  }

  Organization.findAllPaginated = addFindAllPaginated(Organization)

  /**
   * @param {number} page
   * @param {number} pageSize
   * @returns {object}
   * */
  Organization.getWithAppCount = async ({ page = 1, pageSize = 10 } = {}) => {
    const limit = pageSize
    const offset = (page - 1) * pageSize

    const res = await Promise.all([
      Organization.count(),
      sequelize.query(`
          SELECT org.id, org.name, org.description, org.vat, org.logo, org.created_at, org.updated_at, org.tos_url, 
            org.privacy_url, org.youtube_url, org.website_url, org.support_url, org.tax_exempt, add.address
          FROM organization as org
          JOIN (
            SELECT COUNT(*) AS app_count, organization.id AS org_id
            FROM organization
            JOIN app ON organization.id = app.org_id
            WHERE enable = TRUE
            GROUP BY organization.id
          ) app_counts ON organization.id = app_counts.org_id
          LEFT JOIN address as add ON org.address_id = add.id
          LIMIT ?
          OFFSET ?
        `, {
        replacements: [limit, offset],
        model: Organization,
        mapToModel: true,
      }),
    ])

    return {
      rows: res[1],
      pagination: {
        rowCount: res[1].length,
        pageCount: Math.ceil((res[1].length || 0) / pageSize),
        page,
        pageSize,
      },
    }
  }

  Organization.getOwnerOrganization = async () => {
    const ownerOrg = await sequelize.query('SELECT organization_id FROM owner_organization', { type: sequelize.QueryTypes.SELECT })
    if (!ownerOrg || ownerOrg.length !== 1) {
      return null
    }

    return Organization.findByPk(ownerOrg[0].organization_id)
  }

  return Organization
}

module.exports = organization
