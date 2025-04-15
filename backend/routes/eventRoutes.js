const express = require('express');

const multer = require('multer');// Import multer for file upload handling
const upload = multer({ dest: 'uploads/' }); // temporary storage for uploaded .ics files

const { createNewEvent, getEvents, updateEvent, updateMultipleEvent, deleteEvent, deleteMultipleEvent, exportEvent, importEvents } = require('../controllers/eventController');

const router = express.Router();

// Event endpoints
router.post('/event', createNewEvent);
router.get('/events', getEvents);
router.put('/event/:eventId', updateEvent);
router.put('/event/original/:originalId', updateMultipleEvent);
router.delete('/event/:eventId', deleteEvent);
router.delete('/event/original/:originalId', deleteMultipleEvent);
router.get('/event/:eventId/export', exportEvent);
router.post('/events/import', upload.array('icsFiles'), importEvents);

module.exports = router;