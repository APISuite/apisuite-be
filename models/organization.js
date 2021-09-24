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
    org_code: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  Organization.afterCreate((org, options) => {
    publishEvent(routingKeys.ORG_CREATED, {
      id: org.id,
    })
  })

  Organization.associate = (models) => {
    Organization.belongsTo(models.Address, { foreignKey: 'id' })
  }

  Organization.getAll = async ({ page = 1, pageSize = 10 } = {}) => {
    const limit = pageSize
    const offset = (page - 1) * pageSize

    const res = await Promise.all([
      Organization.count(),
      sequelize.query(`
          SELECT a.id, a.name, a.description,
            a.vat,
            a.logo,
            a.org_code,
            a.created_at,
            a.updated_at,
            a.tos_url,
            a.privacy_url,
            a.youtube_url,
            a.website_url,
            a.support_url,
            a.tax_exempt,
            b.address,
            b.postal_code,
            b.city,
            b.country 
          FROM organization as a LEFT JOIN public.address as b ON a.address_id = b.id
          LIMIT ?
          OFFSET ?`, {
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
          SELECT a.id, a.name, a.description, a.vat, a.logo, a.org_code, a.created_at, a.updated_at, a.tos_url, a.privacy_url, a.youtube_url, a.website_url, a.support_url, a.tax_exempt, b.address
          FROM organization as a
          JOIN (
            SELECT COUNT(*) AS app_count, organization.id AS org_id
            FROM organization
            JOIN app ON organization.id = app.org_id
            WHERE enable = TRUE
            GROUP BY organization.id
          ) app_counts ON organization.id = app_counts.org_id
          LEFT JOIN public.address_organization as b ON a.id = cast (b.org_id as INTEGER)
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

  Organization.getById = async (orgId) => {
    const orgById = sequelize.query(`
          SELECT a.id, a.name, a.description,
            a.vat,
            a.logo,
            a.org_code,
            a.created_at,
            a.updated_at,
            a.tos_url,
            a.privacy_url,
            a.youtube_url,
            a.website_url,
            a.support_url,
            a.tax_exempt,
            b.address,
            b.postal_code,
            b.city,
            b.country 
          FROM organization as a LEFT JOIN public.address as b ON a.address_id = b.id WHERE a.id = ?`, {
      replacements: [orgId],
      model: Organization,
      mapToModel: true,
    })
    return orgById
  }

  return Organization
}

module.exports = organization
