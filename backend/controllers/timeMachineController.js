const TimeMachine = require('../models/timeMachineModel');
const { setTimeMachine, resetTimeMachine, isActive } = require('../services/timeMachineService');

const { combineDateTime } = require('../utils/utils');

//function to set the time in the TimeMachine
const setTime = async (req, res) => {
    const { date, time } = req.body;

    try {
        const dateTime = combineDateTime(date, time);
        if (!dateTime) return res.status(400).json({ success: false, message: 'Invalid date or time format' });

        setTimeMachine(dateTime);
        
        res.status(200).json({ success: true, message: 'Time set successfully' });
    }catch (error) {
        console.error('Error setting time:', error);
        res.status(500).json({ success: false, message: 'Error setting time' });
    }
};

//function to reset the time in the TimeMachine
const resetTime = async (req, res) => {
    try {
        resetTimeMachine();

        res.status(200).json({ success: true, state, timeEntry, message: 'Time reset successfully' });
    } catch (error) {
        console.error('Error resetting time:', error);
        res.status(500).json({ success: false, message: 'Error resetting time' });
    }
};

const getIsActive = async (req, res) => {
    try {
        const state = isActive();
        res.status(200).json({ success: true, state });
    } catch (error) {
        console.error('Error getting time machine state:', error);
        res.status(500).json({ success: false, message: 'Error getting time machine state' });
    }
};

module.exports = {
    setTime,
    resetTime,
    getIsActive,
};