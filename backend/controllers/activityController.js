const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const { createNotification } = require('../controllers/notificationController');

// Creating an activity
const createActivity = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { title, deadline, completed, notify, notificationTime, sharedWith} = req.body;
    
    try {
        // TODO: da aggiungere la logica degli eventi e delle attività condivise
        let sharedWithUsers = [];
        if (sharedWith && Array.isArray(sharedWith)) {
            sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('_id');
        }
        const activity = new Activity({ title, deadline, completed, user: user._id, notify, notificationTime, sharedWith: sharedWithUsers.map(u => u._id), });
        const savedActivity = await activity.save();
        if (notify) await createNotification({ activityId: savedActivity._id }, res, true);
        console.log(savedActivity);
        res.status(200).json(savedActivity);
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: error.message });
    }
};

// fetch all activities
const getActivities = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    
    try {
        const activities = await Activity.find({user: user._id});
        res.status(200).json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: error.message });
    }
};

// Updating an activity
const updateActivity = async (req, res) => {
    const{activityId} = req.params;
    const {title, deadline, completed} = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        //we find the current user and check if it is his activity
        if (activity.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not allowed to update this activity" });
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
