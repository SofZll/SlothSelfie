const express = require('express');

const { createEvent, getEvents, updateEvent, deleteEvent, deleteMultipleEvent } = require('../controllers/eventController');

const router = express.Router();

// Event endpoints
router.post('/event', createEvent);
router.get('/events', getEvents);
router.put('/event/:eventId', updateEvent);
router.delete('/event/:eventId', deleteEvent);
router.delete('/event/original/:originalId', deleteMultipleEvent);

module.exports = router;