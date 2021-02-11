const { addFindAllPaginated } = require('../util/pagination')

const userOrganization = (sequelize, DataTypes) => {
  const UserOrganization = sequelize.define('user_organization', {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    org_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'organization',
        key: 'id',
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'role',
        key: 'id',
      },
    },
    current_org: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    timestamp: true,
    underscored: true,
    freezeTableName: true,
  })

  UserOrganization.associate = (models) => {
    UserOrganization.belongsTo(models.User, { foreignKey: 'user_id', as: 'User', onDelete: 'CASCADE' })
    UserOrganization.belongsTo(models.Organization, { foreignKey: 'org_id', as: 'Organization', onDelete: 'CASCADE' })
    UserOrganization.belongsTo(models.Role, { foreignKey: 'role_id', as: 'Role', onDelete: 'CASCADE' })
  }

  UserOrganization.findMembers = async (orgId, models) => {
    return UserOrganization.findAll({
      where: {
        org_id: orgId,
      },
      order: [
        ['User', 'name', 'ASC'],
        ['User', 'created_at', 'ASC'],
      ],
      attributes: ['created_at', 'updated_at'],
      include: [{
        model: models.User,
        as: 'User',
        attributes: ['name', 'id'],
      }, {
        model: models.Role,
        as: 'Role',
        attributes: ['name', 'id'],
      }, {
        model: models.Organization,
        as: 'Organization',
        attributes: ['name', 'id'],
      }],
    })
  }

  /**
   * Returns a list of organizations belonging to a user,
   * along with the count of admins/organizationOwners in those organizations
   * @param {number} userID
   * @param {object} transaction
   * @returns {array}
   * */
  UserOrganization.getUserOrgsWithUsersCount = async (userID, transaction) => {
    const query = `
      SELECT 
          user_org.org_id,
          org.name AS org_name,
          role.name AS role_name,
          user_org.role_id,
          CAST(counts.users_count AS integer),
          CAST(counts.admins AS integer),
          CAST(counts.organization_owners AS integer),
          CAST(counts.developers AS integer)
      FROM user_organization user_org
      JOIN organization org ON user_org.org_id = org.id
      JOIN role ON role.id = user_org.role_id
      JOIN (
          SELECT
              org_id,
              COUNT(*) AS users_count,
              SUM(CASE WHEN role_id = (SELECT id FROM role WHERE name = 'admin') THEN 1 ELSE 0 END) AS admins,
              SUM(CASE WHEN role_id = (SELECT id FROM role WHERE name = 'organizationOwner') THEN 1 ELSE 0 END) AS organization_owners,
              SUM(CASE WHEN role_id = (SELECT id FROM role WHERE name = 'developer') THEN 1 ELSE 0 END) AS developers
          FROM user_organization
          WHERE org_id IN (
              SELECT org_id
              FROM user_organization
              WHERE user_id = ?
          )
          GROUP BY org_id
      ) counts ON counts.org_id = user_org.org_id
      WHERE user_id = ?;
    `

    const res = await sequelize.query(query, {
      replacements: [userID, userID],
      transaction,
    })

    return res[1].rows
  }

  UserOrganization.findAllPaginated = addFindAllPaginated(UserOrganization)

  return UserOrganization
}

module.exports = userOrganization
