const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const { createNotification } = require('../controllers/notificationController');

// Creating an activinotenotety
const createActivity = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { title, deadline, completed, notify, notificationTime, sharedWith} = req.body;
    
    try {
        let sharedWithUsers = [];
        if (sharedWith && Array.isArray(sharedWith)) {
            sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('_id');
        }
        const activity = new Activity({ title, deadline, completed, user: user._id, notify, notificationTime, sharedWith: sharedWithUsers.map(u => u._id), });
        const savedActivity = await activity.save();

        // Create a notification if the notify flag is set
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
        const activities = await Activity.find({
            $or: [
              { user: user._id }, // activities created by the user
              { sharedWith: user._id } // activities shared with the user
            ]
          })
        .populate('sharedWith', 'username');// Populates the sharedWith field with the username of the users
        //we only need the username on the frontend
        const activitiesWithUsernames = activities.map(activities => ({
            ...activities.toObject(),
            sharedWith: activities.sharedWith.map(user => user.username)
          }));
        res.status(200).json(activitiesWithUsernames);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: error.message });
    }
};

// Updating an activity
const updateActivity = async (req, res) => {
    const{activityId} = req.params;
    const {title, deadline, completed, sharedWith} = req.body;
    const userName = req.session.username;
    // Log per verificare il nome utente
    console.log("User in session:", userName);

    const user = await User.findOne({ username: userName });

    // get the users to share the activity with
    let sharedWithUsers = [];
    if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
      sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('username');
    }
    console.log(sharedWithUsers);

    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        //we find the current user and check if it is his activity, or if it is shared with him
        if (activity.user.toString() !== user._id.toString()&& !activity.sharedWith.includes(user._id.toString())) {
            return res.status(403).json({ message: "You are not allowed to update this activity" });
        }

        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { title, deadline, completed, sharedWith: sharedWithUsers.map(u => u._id) },
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
