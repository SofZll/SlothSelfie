const express = require('express');

const { createNote, getNotes, getNote, updateNote, deleteNote } = require('../controllers/noteController');

const router = express.Router();

// Note endpoints
router.post('/note', createNote);
router.get('/notes', getNotes);
router.get('/note/get/:noteId', getNote);
router.put('/note/:noteId', updateNote);
router.delete('/note/:noteId', deleteNote);

module.exports = router;