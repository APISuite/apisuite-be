const inviteOrganization = (sequelize, DataTypes) => {
  const InviteOrganization = sequelize.define('invite_organization', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'organization',
        key: 'id',
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM({
        values: ['pending', 'accepted'],
      }),
      allowNull: false,
    },
    confirmation_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  })

  InviteOrganization.associate = (models) => {
    InviteOrganization.belongsTo(models.User, { foreignKey: 'user_id', as: 'User', onDelete: 'CASCADE' })
    InviteOrganization.belongsTo(models.Organization, { foreignKey: 'org_id', as: 'Organization', onDelete: 'CASCADE' })
    InviteOrganization.belongsTo(models.Role, { foreignKey: 'role_id', as: 'Role', onDelete: 'CASCADE' })
  }

  InviteOrganization.findByConfirmationToken = (token) => {
    return InviteOrganization.findOne({
      where: { confirmation_token: token, status: 'pending' },
    })
  }

  return InviteOrganization
}

module.exports = inviteOrganization
