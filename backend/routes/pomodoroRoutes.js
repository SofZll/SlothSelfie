const express = require('express');

const { getPomodori, getPomodoriToDo } = require('../controllers/pomodoroController');
const router = express.Router();

// Pomodoro endpoints
router.get('/pomodori', getPomodori);
router.get('/pomodori/todo', getPomodoriToDo);

module.exports = router;