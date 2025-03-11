const express = require('express');

const { createActivity, getActivities, getActivity, updateActivity, deleteActivity, createInputAsNote, createOutputAsNote, updateOutputAsNote, updateActivityStatus } = require('../controllers/activityController');

const router = express.Router();

// Activity endpoints
router.post('/activity', createActivity);
router.get('/activities', getActivities);
router.get('/activity/:activityId', getActivity);
router.put('/activity/:activityId', updateActivity);
router.delete('/activity/:activityId', deleteActivity);
router.post('/activity/input', createInputAsNote);
router.post('/activity/output', createOutputAsNote);
router.put('/activity/output/update', updateOutputAsNote);
router.put('/activity/status/:activityId', updateActivityStatus);

module.exports = router;