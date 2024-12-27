const express = require('express');

const { createTask, getTasks, deleteTask, markTaskCompleted, addTasks } = require('../controllers/taskController');
const router = express.Router();

// Task endpoints
router.post('/task', createTask);
router.get('/tasks', getTasks);
router.delete('/task/:taskId', deleteTask);
router.put('/task/complete/:taskId', markTaskCompleted);
router.post('/tasks', addTasks);

module.exports = router;