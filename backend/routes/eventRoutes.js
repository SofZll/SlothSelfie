const express = require('express');

const multer = require('multer');// Import multer for file upload handling
const upload = multer({ dest: 'uploads/' }); // temporary storage for uploaded .ics files

const { createNewEvent, getEvents, updateEvent, deleteEvent, exportEvent, importEvents } = require('../controllers/eventController');

const router = express.Router();

// Event endpoints
router.get('/events', getEvents);
router.post('/event', createNewEvent);
router.post('/event/import', upload.array('icsFiles'), importEvents);
router.put('/event/:eventId', updateEvent);
router.delete('/event/:eventId', deleteEvent);
router.get('/event/:eventId/export', exportEvent);

module.exports = router;