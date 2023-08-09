const { Note } = require('../services/databaseService');
const redisService = require('../services/redisService');
const logger = require("../services/loggerService");

// Create a new note associated with the user
async function createNote(req, res) {
  try {
    const userId = req.user.data; // Get the authenticated user's ID from the token
    const { type, title, content } = req.body;

    if (!type || !['personal', 'work'].includes(type)) {
      return res.status(400).json({ error: 'Invalid note type' });
    }

    const note = await Note.create({ type, title, content, userId });

    res.json(note);
  } catch (err) {
    logger.error('Error creating note:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
  

// Retrieve all notes associated with the user
async function getNotes(req, res) {
  try {
    const userId = req.user.data; // Get the authenticated user's ID from the token

    // Fetch all notes associated with the user from the database
    const notes = await Note.findAll({ where: { userId } });

    res.json(notes);
  } catch (err) {
    logger.error('Error retrieving notes:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// Retrieve a specific note associated with the user by note ID. Has cache
async function getNoteById(req, res) {
  try {
    const userId = req.user.data; 
    const noteId = req.params.noteId; // Get the note ID from the request parameters

    // Check if the note is already cached in Redis
    const cachedNote = await redisService.get(noteId);
    if (cachedNote) {
      // If cached note exists, return it directly
      logger.info('Fetching note from cache...');
      return res.json(JSON.parse(cachedNote));
    }

    // If note is not cached, fetch it from the database
    const note = await Note.findOne({ where: { id: noteId, userId } });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Cache the fetched note in Redis
    await redisService.set(noteId, JSON.stringify(note), 3600); // Cache for 1 hour (3600 seconds)

    res.json(note);
  } catch (err) {
    logger.error('Error retrieving note:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// Update a specific note associated with the user
async function updateNote(req, res) {
  try {
    const userId = req.user.data; // Get the authenticated user's ID from the token
    const noteId = req.params.noteId; // Get the note ID from the request params
    const { title, content } = req.body;

    // Find the note associated with the user and the provided note ID
    const note = await Note.findOne({ where: { id: noteId, userId } });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note with the new title and content
    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    // Invalidate the cache after updating a new note
    await redisService.invalidate(noteId);

    res.json(note);
  } catch (err) {
    logger.error('Error updating note:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// Delete a specific note associated with the user
async function deleteNote(req, res) {
  try {
    const userId = req.user.data; // Get the authenticated user's ID from the token
    const noteId = req.params.noteId; // Get the note ID from the request params

    // Find the note associated with the user and the provided note ID
    const note = await Note.findOne({ where: { id: noteId, userId } });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete the note from the database
    await note.destroy();

    // Invalidate the cache after delete note
    await redisService.invalidate(noteId);

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    logger.error('Error deleting note:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  createNote
};