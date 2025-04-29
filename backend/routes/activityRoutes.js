const express = require('express');

const { createActivity, getActivities, getActivity, updateActivity, deleteActivity, exportActivity, createNoteAsInputOrOutput, updateOutputAsNote, updateActivityStatus, adjustOrContractActivitySchedule } = require('../controllers/activityController');

const router = express.Router();

// Activity endpoints
router.post('/activity', createActivity);
router.get('/activities', getActivities);
router.get('/activity/:activityId', getActivity);
router.put('/activity/:activityId', updateActivity);
router.delete('/activity/:activityId', deleteActivity);
router.get('/activity/:activityId/export', exportActivity);
router.post('/activity/inputOutput', createNoteAsInputOrOutput);
router.put('/activity/output/update', updateOutputAsNote);
router.put('/activity/status/:activityId', updateActivityStatus);
router.put('/activity/:activityId/schedule', adjustOrContractActivitySchedule);

module.exports = router;