const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const noteRoutes = require('./noteRoutes');
const activityRoutes = require('./activityRoutes');
const eventRoutes = require('./eventRoutes');
const notificationRoutes = require('./notificationRoutes');
const contentRoutes = require('./contentRoutes');
const timeMachineRoutes = require('./timeMachineRoutes');
const taskRoutes = require('./taskRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const projectRoutes = require('./projectsRoutes');
const chatRoutes = require('./chatRoutes');

router.use('/api', userRoutes);
router.use('/api', noteRoutes);
router.use('/api', activityRoutes);
router.use('/api', eventRoutes);
router.use('/api', notificationRoutes);
router.use('/api', contentRoutes);
router.use('/api', timeMachineRoutes);
router.use('/api', taskRoutes);
router.use('/api', subscriptionRoutes);
router.use('/api', projectRoutes);
router.use('/api', chatRoutes);

module.exports = router;