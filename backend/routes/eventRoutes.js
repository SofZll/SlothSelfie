const express = require('express');

const multer = require('multer');// Import multer for file upload handling
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage to keep files in memory instead of saving them to disk
//const upload = multer({ dest: 'uploads/' }); // temporary storage for uploaded .ics files

const { createNewEvent, getEvents, updateEvent, deleteEvent, exportEvent, importEvents } = require('../controllers/eventController');

const router = express.Router();

// Event endpoints
router.get('/events', getEvents);
router.post('/event', createNewEvent);
router.post('/events/import', upload.array('icsFiles'), importEvents);  
router.put('/event/:eventId', updateEvent);
router.delete('/event/:eventId', deleteEvent);
router.get('/event/:eventId/export', exportEvent);
 
module.exports = router;