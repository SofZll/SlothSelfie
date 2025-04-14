const express = require('express');

const { createNewEvent, getEvents, updateEvent, updateMultipleEvent, deleteEvent, deleteMultipleEvent, exportEvent } = require('../controllers/eventController');

const router = express.Router();

// Event endpoints
router.post('/event', createNewEvent);
router.get('/events', getEvents);
router.put('/event/:eventId', updateEvent);
router.put('/event/original/:originalId', updateMultipleEvent);
router.delete('/event/:eventId', deleteEvent);
router.delete('/event/original/:originalId', deleteMultipleEvent);
router.get('/event/:eventId/export', exportEvent);

module.exports = router;