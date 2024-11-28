// eventController.js
const Activity = require('../models/activityModel');

// Creating an activity
const createActivity = async (req, res) => {
    try {
        const newActivity = new Activity(req.body);
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// fetch all activities
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ username: req.session.username }); // filtering activities by user
        res.status(200).json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ success: false, message: 'Error fetching activities' });
    }
};

// Updating an activity
const updateActivity = async (req, res) => {
    try {
        const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Deleting an activity
const deleteActivity = async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Activity deleted succesfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createActivity,
    getActivities,
    updateActivity,
    deleteActivity
};
