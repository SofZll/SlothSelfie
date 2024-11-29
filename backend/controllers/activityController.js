// eventController.js
const Activity = require('../models/activityModel');
const User = require('../models/userModel');

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
    const{activityId} = req.params;
    const {title, deadline, completed} = req.body;
    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        //we find the current user and check if it is his activity
        const currentUser = await User.findById(req.session.userId);
        console.log('Current user:', currentUser);
        console.log('Activity user:', activity.userId);
        if (!currentUser) {
            return res.status(401).json({ message: "User not found" });
        }
        if (activity.userId.toString() !== currentUser.username) {
            return res.status(403).json({ message: "You are not authorized to edit this activity" });
        }

        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { title, deadline, completed },
            { new: true }
        );
        res.status(200).json(updatedActivity);

    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ message: error.message });
    }
};

// Deleting an activity
const deleteActivity = async (req, res) => {
    const {activityId} = req.params;
    try {
        const activity = await Activity.findByIdAndDelete(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        res.status(200).json({ message: "Activity deleted succesfully" });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createActivity,
    getActivities,
    updateActivity,
    deleteActivity
};
