const express = require('express');

const { getPomodori, getPomodoriToDo, addPomodoro, editPomodoro, deletePomodoro, updateCycles, addAdditionalCycle, getPomodoroById, totalStudiedTime, timePomodoriMonths } = require('../controllers/pomodoroController');
const router = express.Router();

// Pomodoro endpoints
router.get('/pomodori', getPomodori);
router.get('/pomodori/todo', getPomodoriToDo);
router.get('/pomodori/studied-time', totalStudiedTime);
router.get('/pomodori/months', timePomodoriMonths);
router.get('/pomodori/:pomodoroId', getPomodoroById);

router.post('/pomodoro', addPomodoro);

router.put('/pomodoro/:pomodoroId', editPomodoro);
router.put('/pomodoro/update-cycles/:pomodoroId', updateCycles);
router.put('/pomodoro/add-additional-cycle/:pomodoroId', addAdditionalCycle);

router.delete('/pomodoro/:pomodoroId', deletePomodoro);


module.exports = router;