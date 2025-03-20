const express = require('express');

const { createActivity, getActivities, getActivity, updateActivity, deleteActivity, createInputAsNote, createOutputAsNote, updateOutputAsNote, updateActivityStatus, adjustActivitySchedule, contractActivitySchedule, adjustOrContractActivitySchedule } = require('../controllers/activityController');

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
router.put('/activity/:activityId/adjustSchedule', adjustActivitySchedule);
router.put('/activity/:activityId/contractSchedule', contractActivitySchedule);
router.put('/activity/:activityId/schedule', adjustOrContractActivitySchedule);

module.exports = router;