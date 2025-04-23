const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const Note = require('../models/noteModel');
const Event = require('../models/eventModel');
const PhaseSubphase = require("../models/phaseSubphaseModel");
const {sendExportEmail} = require('../utils/utils');
const { createEvent } = require('ics'); // Import the library for iCalendar generation

// Creating an activinotenotety
const createActivity = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { title, deadline, completed, sharedWith} = req.body;
    
    try {
        let sharedWithUsers = [];
        sharedWithUsers.push(user);
        if (sharedWith && Array.isArray(sharedWith)) {
            sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('_id');
        }
        const activity = new Activity({ title, deadline, completed, user: user._id, sharedWith: sharedWithUsers.map(u => u._id), });
        const savedActivity = await activity.save();

        const populatedActivity = await Activity.findById(savedActivity._id).populate('user', 'username').populate('description', 'content').populate('sharedWith', 'username');

        res.status(200).json({ success: true, activity: populatedActivity });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// fetch all activities
const getActivities = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    
    try {
        const activities = await Activity.find({
            $or: [
                { user: user._id },
                { sharedWith: user._id }
            ]
        })
        .populate('user', 'username')
        .populate('description', 'content' )
        .populate('sharedWith', 'username');
        
        res.status(200).json({ success: true, activities });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetching a single activity
const getActivity = async (req, res) => {
    const {activityId} = req.params;
    try {
        const activity = await Activity.findById(activityId).populate('sharedWith', 'username');
        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }
        res.status(200).json({ success: true, activity });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Updating an activity
const updateActivity = async (req, res) => {
    const{activityId} = req.params;
    const {title, deadline, completed, sharedWith} = req.body;
    const userName = req.session.username;

    const user = await User.findOne({ username: userName });

    // get the users to share the activity with
    let sharedWithUsers = [];
    if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
      sharedWithUsers = await User.find({ username: { $in: sharedWith } }).select('username');
    }

    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }
        //we find the current user and check if it is his activity, or if it is shared with him
        if (activity.user.toString() !== user._id.toString() && !activity.sharedWith.includes(user._id.toString())) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this activity" });
        }

        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { title, deadline, completed, sharedWith: sharedWithUsers.map(u => u._id) },
            { new: true }
        ).populate('user', 'username')
        .populate('description', 'content')
        .populate('sharedWith', 'username');

        res.status(200).json({ success: true, activity: updatedActivity });

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
            return res.status(404).json({ success: false, message: "Activity not found" });
        }

        res.status(200).json({ success: true, message: "Activity deleted successfully" });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//Function to export activities on iCalendar (using library: ics.js)
async function exportActivity(req, res){
    try {
        const {activityId} = req.params;
        const userName = req.session.username;
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }

        const user = await User.findOne({ username: userName });

        const { error, value } = createEvent({
            title: activity.title,
            description: '',
            start: [
                activity.deadline.getFullYear(),
                activity.deadline.getMonth() + 1,
                activity.deadline.getDate(),
            ]
        });
        
        if (error) {
            console.error("ICS generation error:", error);
            return res.status(500).json({ success: false, message: 'Error generating ICS file' });
        }

        // send the mail with the .ics file as attachment to the user
        const userEmail = user.email;

        await sendExportEmail(
            userEmail,
            `${activity.title}.ics`,
            value
        );
    
        //download the file on frontend
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${activity.title}.ics"`);
        res.status(200).send({ success: true, value });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: 'Error exporting activity' });
      }
}

/* Project functions */
//Function to create a note associated to the input/output of the activity
async function createNoteAsInputOrOutput(req, res) {
    try {
        const { activityId, content, userName, type } = req.body;

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
            title: type === 'input' ? "Activity Input" : "Activity Output",
            category: type === 'input' ? "Activity Input" : "Activity Output",
            content: content,
            user: user,
            noteAccess: "restricted", // only for members
            allowedUsers: allowedUsernames,
            isInProject: true, // to differentiate between normal notes and project-activity notes
        });
        const savedNote = await newNote.save();

        // Update the input or output field of the activity with the id of the note created
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            { [type]: savedNote._id },
            { new: true }
        );

        if (!updatedActivity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }

        res.status(201).json({ success: true, message: "Note created and linked to activity", note: savedNote });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ success: false, message: "Server error" });
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

        res.status(201).json({ success: true, message: "Note updated successfully", note: savedNote });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ success: false, message: "Server error" });
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
            return res.status(404).json({ success: false, message: "Activity not found" });
        }
        
        // Update the status of the activity only if it is different
        if (activity.status === status) {
            return res.status(200).json({ success: true, message: "Status is already set to the requested value" });
        }

        // Update the status of the activity
        activity.status = status;
        await activity.save();

        res.status(200).json({ success: true, message: "Activity status updated successfully", activity });
    }
    catch (error) {
        console.error("Error updating activity status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

//Function to adjust or contract the schedule of an activity, options are 'delay' or 'contract'
//if delay, we adjust both startDate and deadline (shift)
//if contract, we contract only startDate (reduce), deadline remains the same
//we also update the events connected to startDate and/or deadline
//we finally send a notification to the users involved in the activity
async function adjustOrContractActivitySchedule(req, res) {
    try {
        const { dependentActivitiesIds, delay, action } = req.body;

        // Convert the delay in an integer number
        const delayDays = parseInt(delay, 10);

        // Convert the dependentActivitiesIds to an array of ObjectIds
        const activityIdsArray = Array.isArray(dependentActivitiesIds)
            ? dependentActivitiesIds
            : dependentActivitiesIds.split(',').map(id => id.trim());

        // Find the dependent activities and populate the events
        const activities = await Activity.find({ _id: { $in: activityIdsArray } }).populate("events");
        //here we keep the macroactivity deadlines to update them later, if the deadline of the macroactivity is before the new deadline of the activities, we select the bigger one
        const macroDeadlinesMap = new Map();

        const updatePromises = activities.map(async (activity) => {

            const originalStartDate = new Date(activity.startDate);
            const originalDeadline = new Date(activity.deadline);

            if (action === 'delay') {
                // Adjust both startDate and deadline (shift)
                const newStartDate = new Date(originalStartDate);
                newStartDate.setUTCDate(newStartDate.getUTCDate() + delayDays);

                const newDeadline = new Date(originalDeadline);
                newDeadline.setUTCDate(newDeadline.getUTCDate() + delayDays);

                activity.startDate = newStartDate;
                activity.deadline = newDeadline;

                //if the macro has a deadline < newDeadline, we set the deadline to the new deadline and update the deadline event
                const phaseSubphase = await PhaseSubphase.findById(activity.phaseSubphase).populate("macroActivity");
                // Save the macroactivity deadline in the map
                if (phaseSubphase && phaseSubphase.macroActivity) {
                    updateMacroDeadlineMap(macroDeadlinesMap, phaseSubphase.macroActivity, newDeadline);
                }

                // if the macroactivity is in a subphase, we need to check the parent phase and update its macroActivity deadline too
                if (phaseSubphase.type === 'subphase' && phaseSubphase.parentPhase) {
                    const parentPhase = await PhaseSubphase.findById(phaseSubphase.parentPhase).populate("macroActivity");
                    if (parentPhase && parentPhase.macroActivity) {
                        updateMacroDeadlineMap(macroDeadlinesMap, parentPhase.macroActivity, newDeadline);
                    }
                }

            } else if (action === 'contract') {
                // Contract only startDate (reduce), deadline remains the same
                const originalDuration = Math.ceil((originalDeadline - originalStartDate) / (1000 * 60 * 60 * 24));
                let newDuration = originalDuration - delayDays;

                if (newDuration <= 0) {
                    activity.startDate = new Date(originalDeadline);
                } else {
                    let newStartDate = new Date(originalDeadline);
                    newStartDate.setUTCDate(newStartDate.getUTCDate() - newDuration);
                    activity.startDate = newStartDate;
                }
            }

            // Update the events connected to startDate and/or deadline
            const eventUpdates = activity.events.map(async (eventId, index) => {
                const event = await Event.findById(eventId);
                if (event) {
                    if (index === 0) {
                        event.date = activity.startDate;
                    } else if (index === 1 && action === 'delay') {
                        event.date = activity.deadline;
                    }
                    await event.save();
                }
            });

            await Promise.all(eventUpdates);
            return activity.save();
        });

        await Promise.all(updatePromises);

        // Update the macroactivities deadlines once with the max deadline
        for (const [macroId, maxDeadline] of macroDeadlinesMap.entries()) {
            const macro = await Activity.findById(macroId);
            if (macro && new Date(macro.deadline) < maxDeadline) {
                macro.deadline = maxDeadline;
                await macro.save();
                const macroEvent = await Event.findById(macro.events[1]);
                if (macroEvent) {
                    macroEvent.date = maxDeadline;
                    await macroEvent.save();
                } 
            }
        }
        /* Create notifications to send to the users involved in the dependent activities about the schedule change
        const notificationPromises = activities.map(async (activity) => {
            const dateNotif = new Date().toISOString(); //TODO: TIME MACHINE DATE ?
            return createNotification({ elementId: activity._id, dateNotif, frequencyNotif: 'none', type: 'activity' }, res, true);
        });

        await Promise.all(notificationPromises);
        */

        res.status(200).json({ success: true, message: "Schedule adjusted/contracted successfully" ,
            updatedMacros: Array.from(macroDeadlinesMap.entries()) // [ [macroId, newDeadline], ... ]
        });
    }
    catch (error) {
        console.error("Error adjusting/contracting activity schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// Function to update the macroactivity deadline map
// This function updates the macro activity deadline map with the maximum deadline for each macro activity
function updateMacroDeadlineMap(map, macro, deadline) {
    const id = macro._id.toString();
    const prev = map.get(id);
    if (!prev || prev < deadline) {
        map.set(id, deadline);
    }
}

module.exports = {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    exportActivity,
    createNoteAsInputOrOutput,
    updateOutputAsNote,
    updateActivityStatus,
    adjustOrContractActivitySchedule
};
