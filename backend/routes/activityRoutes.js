const express = require('express');

const { createActivity, getActivities, updateActivity, deleteActivity } = require('../controllers/activityController');

const router = express.Router();

// Activity endpoints
router.post('/activity', createActivity);
router.get('/activities', getActivities);
router.put('/activity/:activityId', updateActivity);
router.delete('/activity/:activityId', deleteActivity);

module.exports = router;