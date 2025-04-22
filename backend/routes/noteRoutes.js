const express = require('express');

const { createNote, getNotes, getNote, updateNote, deleteNote } = require('../controllers/noteController');

const router = express.Router();

// Note endpoints
router.get('/notes', getNotes);
router.post('/note', createNote);
router.put('/note/:noteId', updateNote);
router.delete('/note/:noteId', deleteNote);
router.get('/note/get/:noteId', getNote);

module.exports = router;