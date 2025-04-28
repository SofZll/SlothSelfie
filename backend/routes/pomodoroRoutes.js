const express = require('express');

const { getPomodori, getPlannedPomodori, getLastsPomodori, addPomodoro, newPomodoro, editPomodoro, deletePomodoro, updateCycles, addAdditionalCycle, getPomodoroById, totalStudiedTime, timePomodoriMonths } = require('../controllers/pomodoroController');
const router = express.Router();

// Pomodoro endpoints
router.get('/pomodori', getPomodori);
router.get('/pomodori/todo', getPlannedPomodori);
router.get('/pomodori/studied-time', totalStudiedTime);
router.get('/pomodori/months', timePomodoriMonths);
router.get('/pomodori/lasts', getLastsPomodori);

router.get('/pomodoro/:pomodoroId', getPomodoroById);

router.post('/pomodoro', addPomodoro);
router.post('/pomodoro/calendar', newPomodoro);

router.put('/pomodoro/:pomodoroId', editPomodoro);
router.put('/pomodoro/update-cycles/:pomodoroId', updateCycles);
router.put('/pomodoro/add-additional-cycle/:pomodoroId', addAdditionalCycle);

router.delete('/pomodoro/:pomodoroId', deletePomodoro);


module.exports = router;