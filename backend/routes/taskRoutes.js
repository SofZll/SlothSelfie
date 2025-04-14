const express = require('express');

const { getTasks, editTask, deleteTask, markTaskCompleted, exportTask } = require('../controllers/taskController');
const router = express.Router();

// Task endpoints
router.get('/tasks', getTasks);
router.put('/task/:taskId', editTask);
router.delete('/task/:taskId', deleteTask);
router.put('/task/complete/:taskId', markTaskCompleted);
router.get('/task/:taskId/export', exportTask);

module.exports = router;