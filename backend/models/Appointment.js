const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Patient = require('./Patient');

const Appointment = sequelize.define('Appointment', {
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    appointment_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

Appointment.belongsTo(Patient);
Patient.hasMany(Appointment);

module.exports = Appointment;
