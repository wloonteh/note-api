'use strict'

const { Sequelize, DataTypes } = require('sequelize');
const logger = require("./loggerService");
require('dotenv').config()
const sequelize = new Sequelize(process.env.DB_NAME||'notes_app',process.env.DB_USER ||'root',process.env.DB_PASSWORD|| 'password', {
  host: process.env.DB_HOST ||'mysql',
  dialect: 'mysql'
  });

async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Connection to the database has been established successfully.');
    return true
  } catch (err) {
    logger.error('Unable to connect to the database:', err);
    return false
  }
}

// Define the User model
const User = sequelize.define('users', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define the Note model
const Note = sequelize.define('notes', {
  type: {
    type: DataTypes.ENUM('personal', 'work'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  },
});

// Set up associations
User.hasMany(Note,{
  foreignKey: 'userId'
});
Note.belongsTo(User,{
  foreignKey: 'userId'
});

module.exports = {
  sequelize,
  testConnection,
  User,
  Note,
};