const Activity = require('../models/activityModel');
const Content = require('../models/contentModel');
const Event = require('../models/eventModel');
const Note = require('../models/noteModel');
const Notification = require('../models/notificationModel');

// Function to fetch the state given a specific date and time
const fetchState = async (req, res) => {
    try {
        const userId = req.session.userId;
        const date = req.body.date;

        const activities = await Activity.find({ userId, date });
        const contents = await Content.find({ userId, date });
        const events = await Event.find({ userId, date });
        const notes = await Note.find({ userId, date });
        const notifications = await Notification.find({ userId, date });
        
        const state = { 
            activities,
            contents,
            events,
            notes,
            notifications,
        };

        res.status(200).json({ success: true, state });
    } catch (error) {
        console.error('Error fetching state:', error);
        res.status(500).json({ success: false, message: 'Error fetching state' });
    }
};

module.exports = {
    fetchState,
};