const express = require('express');

const { createNote, getNotes, updateNote, deleteNote, getNoteById } = require('../controllers/noteController');

const router = express.Router();

// Note endpoints
router.post('/note', createNote);
router.get('/notes', getNotes);
router.get('/note/:noteId', getNoteById);
router.put('/note/:noteId', updateNote);
router.delete('/note/:noteId', deleteNote);

module.exports = router;