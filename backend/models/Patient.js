const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Patient = sequelize.define('Patient', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = Patient;
