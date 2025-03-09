const express = require('express');

const { createActivity, getActivities, updateActivity, deleteActivity, createInputAsNote } = require('../controllers/activityController');

const router = express.Router();

// Activity endpoints
router.post('/activity', createActivity);
router.get('/activities', getActivities);
router.put('/activity/:activityId', updateActivity);
router.delete('/activity/:activityId', deleteActivity);
router.post('/activity/input', createInputAsNote);

module.exports = router;