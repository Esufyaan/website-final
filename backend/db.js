const { Sequelize } = require('sequelize');

// Create a new instance of Sequelize to connect to your MySQL database
const sequelize = new Sequelize('dental', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// Function to connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Sync the models with the database
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use alter to adjust tables if they already exist
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

// Export sequelize, connectDB, and syncModels functions for use in your main server file
module.exports = { sequelize, connectDB, syncModels };
