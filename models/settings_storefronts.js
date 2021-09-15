
const settingsStoreFronts = (sequelize, DataTypes) => {
    const SettingsStoreFronts = sequelize.define('settings_storefronts', {
        store: {
            type: DataTypes.STRING,
            references: {
                model: 'store',
                key: 'store',
            },
        },
        values: {
            type: DataTypes.JSON,
            references: {
                model: 'values',
                key: 'store',
            },
        },
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    })

    SettingsStoreFronts.findStore = async (store) => {
        return UserOrganization.findOne({
            where: {
                store: store,
            },
        })
    }
    return SettingsStoreFronts
}

module.exports = settingsStoreFronts
