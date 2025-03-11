const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const Note = require('../models/noteModel');
const { createNotification } = require('../controllers/notificationController');
const { calculateDate } = require('../utils/utils');

// Creating an activinotenotety
const createActivity = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { title, deadline, completed, notify, notificationTime, customValue, notificationRepeat, notificationType, sharedWith} = req.body;
    
    try {
        let sharedWithUsers = [];
        sharedWithUsers.push(user);
        if (sharedWith && Array.isArray(sharedWith)) {
            sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('_id');
        }
        const activity = new Activity({ title, deadline, completed, user: user._id, notify, notificationTime, sharedWith: sharedWithUsers.map(u => u._id), });
        const savedActivity = await activity.save();

        // Populate the sharedWith field with the username of the users
        const populatedActivity = await Activity.findById(savedActivity._id).populate('sharedWith', 'username');

        // Calculate the date of the notification
        let dateNotif;
        console.log(customValue);
        if (customValue) dateNotif = new Date(customValue).toISOString();
        else dateNotif = calculateDate(deadline, notificationTime);
        
        // Create a notification if the notify flag is set
        if (notify) await createNotification({ elementId: savedActivity._id, dateNotif, frequencyNotif: notificationRepeat, type: notificationType}, res, true);

        console.log(savedActivity);
        res.status(200).json({
            ...populatedActivity.toObject(),
            sharedWith: populatedActivity.sharedWith.map(user => user.username)
        });
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

// Fetching a single activity
const getActivity = async (req, res) => {
    const {activityId} = req.params;
    try {
        const activity = await Activity.findById(activityId).populate('sharedWith', '_id username');
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        res.status(200).json({
            ...activity.toObject(),
            sharedWith: activity.sharedWith.map(user => user.username) //we include usernames
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: error.message });
    }
};

// Updating an activity
const updateActivity = async (req, res) => {
    const{activityId} = req.params;
    const {title, deadline, completed, sharedWith} = req.body;
    const userName = req.session.username;
    // Log to check the user in session
    console.log("User in session:", userName);

    console.log("Shared with:", sharedWith);

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
        if (activity.user.toString() !== user._id.toString() && !activity.sharedWith.includes(user._id.toString())) {
            return res.status(403).json({ message: "You are not allowed to update this activity" });
        }

        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { title, deadline, completed, sharedWith: sharedWithUsers.map(u => u._id) },
            { new: true }
        ).populate('sharedWith', 'username');

        res.status(200).json({
            ...updatedActivity.toObject(),
            sharedWith: updatedActivity.sharedWith?.map(user => user.username) || []
        });

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

/* Project functions */
//Function to create a note associated to the input of the activity
async function createInputAsNote(req, res) {
    try {
        const { activityId, content, userName } = req.body;

        //find the user from the username:
        const user = await User.findOne({ username: userName });
        console.log(userName);

        //find the activity
        const activity = await Activity.findById(activityId);
        //get the sharedWith users field
        const sharedWithUsers = activity.sharedWith;

        // Create the note
        const newNote = new Note({
            title: "Activity Input",
            category: "Activity Input",
            content: content,
            user: user,
            noteAccess: "restricted", // only for members
            allowedUsers: sharedWithUsers.map(u => u._id)
        });
        const savedNote = await newNote.save();

        // Update the input field of the activity with the id of the note created
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { input: savedNote._id },
            { new: true }
        );

        if (!updatedActivity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        res.status(201).json({ message: "Note created and linked to activity", note: savedNote });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Server error" });
    }
}

//Function to create a note associated to the output of the activity
async function createOutputAsNote(req, res) {
    try {
        const { activityId, content, userName } = req.body;

        //find the user from the username:
        const user = await User.findOne({ username: userName });
        console.log(userName);

        //find the activity
        const activity = await Activity.findById(activityId);
        //get the sharedWith users field
        const sharedWithUsers = activity.sharedWith;

        // Create the note
        const newNote = new Note({
            title: "Activity Output",
            category: "Activity Output",
            content: content,
            user: user,
            noteAccess: "restricted", // only for members
            allowedUsers: sharedWithUsers.map(u => u._id)
        });
        const savedNote = await newNote.save();

        // Update the output field of the activity with the id of the note created
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { output: savedNote._id },
            { new: true }
        );

        if (!updatedActivity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        res.status(201).json({ message: "Note created and linked to activity", note: savedNote });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Server error" });
    }
}

//Function to update the output note of an activity
async function updateOutputAsNote(req, res) {
    try {
        const { activityId, content, userName } = req.body;

        //find the user from the username:
        const user = await User.findOne({ username: userName });
        console.log(userName);

        //find the activity
        const activity = await Activity.findById(activityId);
        
        //find the note associated to the output of the activity
        const noteId = activity.output;
        const note = await Note.findById(noteId);

        //we update the content and the user of the note
        note.content = content;
        note.user = user;

        const savedNote = await note.save();

        res.status(201).json({ message: "Note created and linked to activity", note: savedNote });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ message: "Server error" });
    }
}

//Function to update the status of an activity
async function updateActivityStatus(req, res) {
    try {
        const { activityId } = req.params;
        const { status } = req.body;

        //find the activity
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        
        // Update the status of the activity only if it is different
        if (activity.status === status) {
            return res.status(200).json({ message: "Status already up to date", activity });
        }

        // Update the status of the activity
        activity.status = status;
        await activity.save();

        res.status(200).json(activity);
    }
    catch (error) {
        console.error("Error updating activity status:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    createInputAsNote,
    createOutputAsNote,
    updateOutputAsNote,
    updateActivityStatus
};
