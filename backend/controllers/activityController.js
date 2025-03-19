const mongoose = require("mongoose");
const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const Note = require('../models/noteModel');
const Event = require('../models/eventModel');
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
        //get the sharedWith users field (it contains ObjectIds)
        const sharedWithUsers = activity.sharedWith;

        // Find the users from the sharedWithUsers array
        const allowedUsers = await User.find({ _id: { $in: sharedWithUsers } }).select("username");

        // Get the usernames of the allowed users
        const allowedUsernames = allowedUsers.map(user => user.username);

        // Create the note
        const newNote = new Note({
            title: "Activity Input",
            category: "Activity Input",
            content: content,
            user: user,
            noteAccess: "restricted", // only for members
            allowedUsers: allowedUsernames
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

        // Find the users from the sharedWithUsers array
        const allowedUsers = await User.find({ _id: { $in: sharedWithUsers } }).select("username");

        // Get the usernames of the allowed users
        const allowedUsernames = allowedUsers.map(user => user.username);

        // Create the note
        const newNote = new Note({
            title: "Activity Output",
            category: "Activity Output",
            content: content,
            user: user,
            noteAccess: "restricted", // only for members
            allowedUsers: allowedUsernames
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

//Function to adjust the schedule of an activity
async function adjustActivitySchedule(req, res) {
    try {
        const { dependentActivitiesIds, delay } = req.body;

        //we convert the delay in a number
        const delayDays = parseInt(delay, 10);

        // Update the startDate and deadline of the dependentActivities by adding the delay (shift), we update also the events connected to each startDate and deadline
        
        //convert the dependentActivitiesIds to an array of ObjectIds
        const activityIdsArray = Array.isArray(dependentActivitiesIds)
        ? dependentActivitiesIds
        : dependentActivitiesIds.split(',').map(id => id.trim());

        // Find the dependent activities and populate the events
        const activities = await Activity.find({ _id: { $in: activityIdsArray } }).populate("events");

        // Update the startDate and deadline of the activities
        const updatePromises = activities.map(async (activity) => {

            console.log("Activity startDate and deadLine:", activity.startDate, activity.deadline);

            const newStartDate = new Date(activity.startDate);
            newStartDate.setUTCDate(newStartDate.getUTCDate() + delayDays);

            const newDeadline = new Date(activity.deadline);
            newDeadline.setUTCDate(newDeadline.getUTCDate() + delayDays);

            activity.startDate = newStartDate;
            activity.deadline = newDeadline;

            console.log("Activity shifted startDate and deadLine:", activity.startDate, activity.deadline);

            // Update the events connected to the startDate and deadline of the activity
            const eventUpdates = activity.events.map(async (eventId, index) => {
                const event = await Event.findById(eventId);
                console.log("Event:", event);
                if (event) {
                    // if index 0, it is a startDate, if index 1, it is a deadLine
                    if (index === 0) {
                        event.date = newStartDate;
                    } else if (index === 1) {
                        event.date = newDeadline;
                    }
                    await event.save();
                }
            });

            await Promise.all(eventUpdates);
            return activity.save();
        });

        await Promise.all(updatePromises);

        res.status(200).json({ message: "Schedule adjusted successfully" });
    }
    catch (error) {
        console.error("Error adjusting activity schedule:", error);
        res.status(500).json({ message: "Server error" });
    }
}

//Function to contract the schedule of an activity  //TODO calcola il ritardo, contrai startDate e deadline di tutte le attività dipendenti in base al ritardo e fa update di eventi corrispondenti
async function contractActivitySchedule(req, res) {
    try {
        const { dependentActivitiesIds, delay } = req.body;

        console.log("dependentActivities:", dependentActivitiesIds);
        console.log("delay:", delay);

        res.status(200).json({ message: "Schedule contracted successfully" });
    }
    catch (error) {
        console.error("Error contracting activity schedule:", error);
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
    updateActivityStatus,
    adjustActivitySchedule,
    contractActivitySchedule
};
