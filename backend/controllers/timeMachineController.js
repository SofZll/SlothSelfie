const TimeMachine = require('../models/timeMachineModel');
const Activity = require('../models/activityModel');
const Content = require('../models/contentModel');
const Event = require('../models/eventModel');
const Note = require('../models/noteModel');
const Notification = require('../models/notificationModel');

// Function to fetch the state given a specific date and time
const fetchState = async (req, res) => {
    try {
        const userId = req.session.userId;
        // Gets date and time from TimeMachine
        let timeEntry = await TimeMachine.findOne({ user: userId });

        if (!timeEntry) { //we create a new timeMachine entry if it doesn't exist
            const now = new Date();
            timeEntry = new TimeMachine({
                user: userId,
                date: now,
                time: now.toTimeString().split(' ')[0].slice(0, 5)
            });

            await timeEntry.save();
        }

        const { date } = timeEntry;

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

        const formattedDate = timeEntry.date.toISOString().split('T')[0];

        timeEntry = {
            date: formattedDate,
            time: timeEntry.time
        };

        res.status(200).json({ success: true, state, timeEntry });
    } catch (error) {
        console.error('Error fetching state:', error);
        res.status(500).json({ success: false, message: 'Error fetching state' });
    }
};


//function to set the time in the TimeMachine
const setTime = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { date, time } = req.body;

        if (!date || !time) {
            return res.status(400).json({ success: false, message: "Date and time are required" });
        }

        let timeEntry = await TimeMachine.findOne({ user: userId });
    
        timeEntry.date = date;
        timeEntry.time = time;

        await timeEntry.save();

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

    
        res.status(200).json({ success: true, state, timeEntry, message: 'Time set successfully' });
    }
    catch (error) {
        console.error('Error setting time:', error);
        res.status(500).json({ success: false, message: 'Error setting time' });
    }
};


//function to reset the time in the TimeMachine
const resetTime = async (req, res) => {
    try {
        const userId = req.session.userId;

        let timeEntry = await TimeMachine.findOne({ user: userId });

        const now = new Date();
        timeEntry.date = now;
        timeEntry.time = now.toTimeString().split(' ')[0].slice(0, 5);

        await timeEntry.save();

        const { date } = timeEntry;

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

        const formattedDate = timeEntry.date.toISOString().split('T')[0];

        timeEntry = {
            date: formattedDate,
            time: timeEntry.time
        };

        res.status(200).json({ success: true, state, timeEntry, message: 'Time reset successfully' });
    }
    catch (error) {
        console.error('Error resetting time:', error);
        res.status(500).json({ success: false, message: 'Error resetting time' });
    }
};

module.exports = {
    fetchState,
    setTime,
    resetTime
};