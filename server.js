const express = require('express');
const logger = require('./services/loggerService');
const databaseService = require('./services/databaseService');
const redisService = require('./services/redisService');
const { authenticateToken } = require('./services/authService');
const bodyParser = require('body-parser');
const userController = require('./controllers/userController');
const noteController = require('./controllers/noteController');
const port = 3000
const app = express();


(async () => {
  await redisService.connect();
  await databaseService.testConnection();
})();

app.use(bodyParser.json());

// Health Check Endpoint
app.get('/health', async (req, res) => {
  let redisHealth = redisService.isReady
  let dbHealth = await databaseService.testConnection();
  res.json({ redis: redisHealth, database: dbHealth });
});

// User Registration Endpoint
app.post('/users/register', userController.registerUser);

// User Login Endpoint
app.post('/users/login', userController.loginUser);

// Retrieve all notes associated with the user Endpoint
app.get('/notes', authenticateToken, noteController.getNotes);

// Create a new note Endpoint
app.post('/notes', authenticateToken, noteController.createNote)

// Retrieve specifc note associated with the user Endpoint
app.get('/notes/:noteId', authenticateToken, noteController.getNoteById);

// Update a specific note associated with the user Endpoint
app.put('/notes/:noteId', authenticateToken, noteController.updateNote);

// Delete a specific note associated with the user Endpoint
app.delete('/notes/:noteId', authenticateToken, noteController.deleteNote);


// Start the server
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
