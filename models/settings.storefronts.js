
const settingsStoreFronts = (sequelize, DataTypes) => {
    const SettingsStoreFronts = sequelize.define('settings_storefronts', {
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        values: {
            type: DataTypes.JSON,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    })

    return SettingsStoreFronts
}

module.exports = settingsStoreFronts
