const express = require('express');

const { createTask, getTasks, deleteTask, markTaskCompleted } = require('../controllers/taskController');
const router = express.Router();

// Task endpoints
router.post('/task', createTask);
router.get('/tasks', getTasks);
router.delete('/task/:taskId', deleteTask);
router.put('/task/complete/:taskId', markTaskCompleted);

module.exports = router;