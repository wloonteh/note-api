const { Sequelize, DataTypes } = require('sequelize');
const logger = require("./loggerService");
const sequelize = new Sequelize('notes_app', 'root', 'password', {
  host: 'mysql',
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
const User = sequelize.define('User', {
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
const Note = sequelize.define('Note', {
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