const express = require('express');

const { addNoAvailability, getNoAvailability, deleteNoAvailability, updateNoAvailability } = require('../controllers/noAvailabilityController');
const router = express.Router();

// No availability endpoints
router.get('/no-availabilities', getNoAvailability);
router.post('/no-availability', addNoAvailability);
router.put('/no-availability/:noAvailabilityId', updateNoAvailability);
router.delete('/no-availability/:noAvailabilityId', deleteNoAvailability);

module.exports = router;