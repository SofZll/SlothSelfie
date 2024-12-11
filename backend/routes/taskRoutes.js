const express = require('express');

const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const router = express.Router();

// Task endpoints
router.post('/task', createTask);
router.get('/tasks', getTasks);
router.put('/task/:taskId', updateTask);
router.delete('/task/:taskId', deleteTask);

module.exports = router;