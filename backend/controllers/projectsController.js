const Project = require("../models/projectModel");
const Phase = require("../models/phaseModel");
const Subphase = require("../models/subphaseModel");
const Activity = require("../models/activityModel");
const User = require("../models/userModel");
const Note = require("../models/noteModel");
const Event = require("../models/eventModel");

//GET all projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
        .populate("owner", "username")
        .populate("members", "username"); 

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: error.message });
    }
}

//GET project by id
const getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.findById(id)
        .populate("owner", "username")
        .populate("members", "username")
        .populate("description");
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        //now we get the phases of the project
        project.phases = await Phase.find({ project: id })
        .populate("subphases") // Populate subphases of the phase
        .sort({ createdAt: 1 }); // Sort phases by creation order

        //now we populate the activities of each phase
        for (const phase of project.phases) {
            phase.activities = await Activity.find({ phase: phase._id })
            .populate("description")
            .populate("sharedWith", "username")
            .populate({ path: "input", select: "content" })
            .populate({ path: "output", select: "content" })
            .populate({ path: "dependencies", select: "title" }) 
            .sort({ createdAt: 1 });
        }

         // Populates activities of each subphase
        for (const phase of project.phases) {
            for (const subphase of phase.subphases) {
                subphase.activities = await Activity.find({ subphase: subphase._id })
                .populate("description")
                .populate("sharedWith", "username")
                .populate({ path: "input", select: "content" })
                .populate({ path: "output", select: "content" })
                .populate({ path: "dependencies", select: "title" }) 
                .sort({ createdAt: 1 });
            }
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project by id:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create the activities for the phase/subphase
const createActivities = async (activities, projectId, phaseId, subphaseId, ownerId, projectTitle) => {
    return await Promise.all(activities.map(async (activity) => {

        // Find the users to share the activity with
        const sharedWithUserIds = await User.find({ username: { $in: activity.sharedWith } });

        //create the description note for the activity
        const descriptionNoteId = await createNoteDescription(activity.description, "activity", ownerId, sharedWithUserIds, projectTitle);

        // Create events for the activity start date and deadline
        const eventStartId = await createEvent(activity.startDate, ownerId, sharedWithUserIds, projectTitle, activity.title, "StartDate");
        const eventDeadlineId = await createEvent(activity.deadline, ownerId, sharedWithUserIds, projectTitle, activity.title, "Deadline");

        // get the dependencies of the activity if any
        let dependenciesIds = [];
        if (activity.dependencies && activity.dependencies.length > 0) {
            dependenciesIds = await Activity.find({ _id: { $in: activity.dependencies } }).select('_id');
        }

        // Create the activity
        const newActivity = new Activity({
            title: activity.title,
            description: descriptionNoteId,
            project: projectId,
            phase: phaseId,
            subphase: subphaseId,
            sharedWith: sharedWithUserIds,
            startDate: activity.startDate,
            deadline: activity.deadline,
            user: ownerId,
            milestone: activity.milestone,
            dependencies: dependenciesIds,
            events: [eventStartId, eventDeadlineId]
        });

        const savedActivity = await newActivity.save();
        return savedActivity._id;
    }));
};

//POST create a phase or subphase and return its id
const createPhaseSubphase = async (type, phase, projectId, ownerId, projectTitle) => {
    let newPhase;

    if (type === "phase") {
        newPhase = new Phase({ title: phase.title, project: projectId });
    } else if (type === "subphase") {
        newPhase = new Subphase({ title: phase.title, project: projectId });
    } else {
        throw new Error("Invalid type: must be 'phase' or 'subphase'");
    }

    await newPhase.save(); // we save the new phase/subphase and we get its _id

    const activityIds = await createActivities(phase.activities, projectId, type === "phase" ? newPhase._id : undefined, type === "subphase" ? newPhase._id : undefined, ownerId, projectTitle);

    // We update the phase/subphase with the activities
    await newPhase.updateOne({ $push: { activities: { $each: activityIds } } });

    return newPhase._id;
};

//create the descriptions as notes and return their ids
const createNoteDescription = async (description, type, owner, members, projectTitle) => {
    //if type = project, we create a note with title and category:  "Project Description", in the title we put the project title
    const title = type === "project" 
        ? `Project Description of Project ${projectTitle}` 
        : `Activity Description of Project ${projectTitle}`;

    const category = type === "project" ? "Project Description" : "Activity Description";
    
    // Create the note for the description
    const newNote = new Note({
        title: title,
        category: category,
        content: description, // Content is the description provided
        user: owner, // User is the logged user
        type: type,
        noteAccess: "restricted", // only for members
        allowedUsers: members.map(member => member.username) // Set the allowed users to the members
    });
    await newNote.save();
    return newNote._id;
}

//updates the description of a note
const updateNoteDescription = async (noteId, description, projectTitle, type) => {
    const note = await Note.findById (noteId);
    if (note) {
        note.content = description;

        // Update the title of the note
        note.title = type === "project" 
            ? `Project Description of Project ${projectTitle}` 
            : `Activity Description of Project ${projectTitle}`;
    
        await note.save();
    }
};

//create the events for the activity start date and deadline
const createEvent = async (date, userId, sharedWith, projectTitle, activityTitle, eventType) => {
    const eventTitle = `${activityTitle} - ${eventType} of Project ${projectTitle}`;

    const newEvent = new Event({
        title: eventTitle,
        date: date,
        time: "00:00", //default time
        isPreciseTime: false,
        duration: 1, // default duration
        allDay: true,
        user: userId,
        sharedWith: sharedWith.map(user => user._id),
        notify: true,
        notificationTime: 30,
        isInProject: true
    });

    const savedEvent = await newEvent.save();
    return savedEvent._id; // Ritorna l'ID dell'evento creato
};

//updates the events for the activity start date and deadline
const updateEvent = async (eventId, date, sharedWith, projectTitle, activityTitle, type) => {
    const event = await Event.findById(eventId);
    if (event) {
        event.date = date; //event.date = new Date(event.date);
        event.title = `${activityTitle} - ${type} of Project ${projectTitle}`;
        event.sharedWith = sharedWith.map(user => user._id);
        await event.save();
    }
};

//POST create a project
const createProject = async (req, res) => {
    try {
        const { title, owner, description, members, phases } = req.body;

        // finds the owner ID from the username
        const ownerUser = await User.findOne({ username: owner });
        if (!ownerUser) {
            return res.status(404).json({ message: "Owner not found" });
        }

        // finds the members IDs from the usernames
        const memberUsers = await User.find({ username: { $in: members } });
        const memberIds = memberUsers.map(user => user._id);

        // Create the note
        const newNoteId = await createNoteDescription(description, "project", ownerUser, memberUsers, title);

        // Create the project
        const newProject = new Project({ title, owner: ownerUser._id, description: newNoteId, members: memberIds });
        await newProject.save();

        // Create the phases and subphases with their activities
        const phaseIds = [];
        for (const phase of phases) {
            const phaseId = await createPhaseSubphase("phase", phase, newProject._id, ownerUser._id, title);
            phaseIds.push(phaseId);

            const subphaseIds = [];
            for (const subphase of phase.subphases) {
                const subphaseId = await createPhaseSubphase("subphase", subphase, newProject._id, ownerUser._id, title);
                subphaseIds.push(subphaseId);
            }

            // we update the phase with the subphases
            await Phase.updateOne({ _id: phaseId }, { $set: { subphases: subphaseIds } });
        }

        // we update the project with the phases
        await newProject.updateOne({ $set: { phases: phaseIds } });

        res.status(201).json({ message: "Project, phases, subphases, and activities saved successfully" });
    } catch (error) {
        console.error("Error saving project:", error);
        res.status(500).json({ message: "Server error while saving project" });
    }
};

//updates the existing activities of a phase/subphase
const updateExistingActivities = async (existingActivities, activities, projectTitle) => {

    // finds the exisiting activities
    const existingActivityIds = existingActivities
        .filter(activity => activity._id)  
        .map(activity => activity._id.toString());

    //and updates them
    for (const activity of activities) {
        if (activity._id) {
            const existingActivity = await Activity.findById(activity._id);
            if (existingActivity) {

                //we update the note description
                await updateNoteDescription(existingActivity.description, activity.description, projectTitle, "activity");

                //we update the event start date
                await updateEvent(existingActivity.events[0], activity.startDate, existingActivity.sharedWith, projectTitle, activity.title, "StartDate");
                //we update the event deadline
                await updateEvent(existingActivity.events[1], activity.deadline, existingActivity.sharedWith, projectTitle, activity.title, "Deadline");

                //get the dependencies of the activity if any
                let dependenciesIds = [];
                if (activity.dependencies && activity.dependencies.length > 0) {
                    dependenciesIds = await Activity.find({ _id: { $in: activity.dependencies } }).select('_id');
                }

                existingActivity.title = activity.title;
                existingActivity.sharedWith = await User.find({ username: { $in: activity.sharedWith } });
                existingActivity.startDate = activity.startDate;
                existingActivity.deadline = activity.deadline;
                existingActivity.milestone = activity.milestone;
                existingActivity.dependencies = dependenciesIds;
                await existingActivity.save();
            }
        }
    }
    return existingActivityIds;
};

//PUT update a project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, owner, members, phases } = req.body;

        // Find the project
        let project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Find the owner id
        const ownerUser = await User.findOne({ username: owner });
        if (!ownerUser) {
            return res.status(404).json({ message: "Owner not found" });
        }

        // Find the members ids
        const memberUsers = await User.find({ username: { $in: members } });
        const memberIds = memberUsers.map(user => user._id);

        // Update the project
        project.title = title;
        project.members = memberIds;

        // Update the description note of the project
        await updateNoteDescription(project.description, description, project.title, "project");

        // Update the phases and subphases
        const updatedPhaseIds = [];
        for (const phase of phases) {

            let existingPhase = await Phase.findOne({ _id: phase._id, project: project._id });

            if (existingPhase) {

                // if the phase exists, update it
                existingPhase.title = phase.title;

                // Update the existing activities of the phase
                const existingActivityIds = await updateExistingActivities(existingPhase.activities, phase.activities, project.title);
                // finds the new activities (without an ID)
                const newActivities = phase.activities.filter(activity => !activity._id);
                // creates the new activities and returns their IDs
                const newActivityIds = await createActivities(newActivities, project._id, existingPhase._id, undefined, ownerUser._id, project.title);
                // Adds the new activities to the existing ones (without duplicates)
                existingPhase.activities = Array.from(new Set([...existingActivityIds, ...newActivityIds]));

                await existingPhase.save();

            } else {
                // if the phase does not exist, create it
                const newPhaseId = await createPhaseSubphase("phase", phase, project._id, ownerUser._id, project.title);
                existingPhase = await Phase.findById(newPhaseId);
            }

            // Updates the subphases
            const updatedSubphaseIds = new Set(existingPhase.subphases.map(id => id.toString())); // we keep the existing subphases

            for (const subphase of phase.subphases) {
                let existingSubphase = await Subphase.findOne({ _id: subphase._id, project: project._id });

                if (existingSubphase) {
                    existingSubphase.title = subphase.title;

                    // Update the existing activities of the subphase
                    const existingActivityIds = await updateExistingActivities(existingSubphase.activities, subphase.activities, project.title);
                    // finds the new activities (without an ID)
                    const newActivities = subphase.activities.filter(activity => !activity._id);
                    // creates the new activities and returns their IDs
                    const newActivityIds = await createActivities(newActivities, project._id, undefined, existingSubphase._id, ownerUser._id, project.title);
                    // Adds the new activities to the existing ones (without duplicates)
                    existingSubphase.activities = Array.from(new Set([...existingActivityIds, ...newActivityIds]));

                    await existingSubphase.save();

                } else {
                    const newSubphaseId = await createPhaseSubphase("subphase", subphase, project._id, ownerUser._id, project.title);
                    existingSubphase = await Subphase.findById(newSubphaseId);
                }
                updatedSubphaseIds.add(existingSubphase._id.toString()); // we avoid duplicates

            }

            existingPhase.subphases = Array.from(updatedSubphaseIds);
            await existingPhase.save();
            updatedPhaseIds.push(existingPhase._id);
        }

        // Update the project with the updated phases
        project.phases = updatedPhaseIds;
        await project.save();

        res.status(200).json({ message: 'Project updated successfully', project });

    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: "Server error while updating project" });
    }
};

//DELETE notes and events related to the activities of a project
const deleteRelatedNotesAndEvents = async (activities) => {
    if (!activities || activities.length === 0) return;

    // Collect all note IDs linked to these activities
    const noteIds = activities.map(activity => activity.description);
    // Collect all input/output note IDs linked to these activities
    const inputNoteIds = activities.map(activity => activity.input);
    const outputNoteIds = activities.map(activity => activity.output);

    //find the events linked to these activities and delete them
    const eventIds = activities.flatMap(activity => activity.events);
    if (eventIds.length > 0) {
        await Event.deleteMany({ _id: { $in: eventIds } });
    }

    // Delete all notes
    if (noteIds.length > 0) {
        await Note.deleteMany({ _id: { $in: noteIds } });
    }
    if (inputNoteIds.length > 0) {
        await Note.deleteMany({ _id: { $in: inputNoteIds } });
    }
    if (outputNoteIds.length > 0) {
        await Note.deleteMany({ _id: { $in: outputNoteIds } });
    }

};

//DELETE a project
const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the project
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Find all phases and subphases of the project
        const phases = await Phase.find({ project: id });
        const phaseIds = phases.map(phase => phase._id);

        const subphases = await Subphase.find({ project: id });
        const subphaseIds = subphases.map(subphase => subphase._id);

        // Find all activities linked to this project, its phases, and subphases
        const activities = await Activity.find({
            $or: [{ phase: { $in: phaseIds } }, { subphase: { $in: subphaseIds } }]
        });

        // Delete notes and events related to the activities
        await deleteRelatedNotesAndEvents(activities);

        // Find the note id of the description of the project
        const projectNoteId = project.description;

        //delete the description note of the project
        if (projectNoteId) {
            await Note.findByIdAndDelete(projectNoteId);
        }

        // Delete all activities
        await Activity.deleteMany({ _id: { $in: activities.map(a => a._id) } });

        // Delete all subphases
        await Subphase.deleteMany({ _id: { $in: subphaseIds } });

        // Delete all phases
        await Phase.deleteMany({ _id: { $in: phaseIds } });

        // Delete the project
        await Project.findByIdAndDelete(id);

        res.status(200).send("Project and associated data deleted successfully.");
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: error.message });
    }
}

//Delete a phase from the project, with its subphases and activities
const removePhaseFromBackend = async (req, res) => {
    const { projectId, phaseId } = req.body;

    try {
        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Find the phase
        const phase = await Phase.findById(phaseId);
        if (!phase) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        // Remove the phase from the project's phases array
        project.phases = project.phases.filter(p => p.toString() !== phaseId);
        await project.save();

        // Gets the ids of the subphases of the phase
        const subphaseIds = phase.subphases.map(sp => sp._id);

        // Get all activities belonging to the phase and its subphases
        const activities = await Activity.find({
            $or: [{ phase: phaseId }, { subphase: { $in: subphaseIds } }]
        });

        // Delete notes and events related to the activities
        await deleteRelatedNotesAndEvents(activities);

        // Delete the activities of the phase and its subphases
        await Activity.deleteMany({ _id: { $in: activities.map(a => a._id) } });

        // Delete the subphases of the phase
        await Subphase.deleteMany({ _id: { $in: subphaseIds } });

        // Delete the phase
        await Phase.findByIdAndDelete(phaseId);

        res.status(200).json({ 
            success: true, 
            message: "Phase, its subphases, and associated activities deleted successfully.",
            deletedPhaseId: phaseId
        });

    } catch (error) {
        console.error('Error deleting phase:', error);
        res.status(500).json({ message: error.message });
    }
};

//Delete a subphase from the project, with its activities
const removeSubphaseFromBackend = async (req, res) => {
    const { projectId, phaseId, subphaseId } = req.body;

    try {
        // find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        let subphaseDeleted = false;

        // if the subphase is in a phase
        if (phaseId) {
            const phase = await Phase.findById(phaseId);
            if (!phase) {
                return res.status(404).json({ message: 'Phase not found' });
            }

            const initialLength = phase.subphases.length;
            phase.subphases = phase.subphases.filter(sp => sp.toString() !== subphaseId);

            if (phase.subphases.length !== initialLength) {
                await phase.save();
                subphaseDeleted = true;
            }
        }

        if (!subphaseDeleted) {
            return res.status(404).json({ message: 'Subphase not found in project or phase' });
        }

        // delete the subphase and its activities
        const activities = await Activity.find({ subphase: subphaseId });

        // Delete notes and events related to the activities
        await deleteRelatedNotesAndEvents(activities);

        // Delete the activities
        await Activity.deleteMany({ subphase: subphaseId });

        // Delete the subphase
        await Subphase.findByIdAndDelete(subphaseId);

        return res.status(200).json({ success: true, message: "Subphase and its activities deleted successfully." });

    } catch (error) {
        console.error('Error deleting subphase:', error);
        return res.status(500).json({ message: error.message });
    }
};

//Delete an activity from the project
const removeActivityFromBackend = async (req, res) => {
    const { projectId, phaseId, subphaseId, activityId } = req.body;

    try {
        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        let activityDeleted = false;

        // if the activity is in a phase
        if (phaseId) {
            const phase = await Phase.findById(phaseId);
            if (!phase) {
                return res.status(404).json({ message: 'Phase not found' });
            }

            const initialLength = phase.activities.length;
            phase.activities = phase.activities.filter(activity => activity.toString() !== activityId);
            
            if (phase.activities.length !== initialLength) {
                await phase.save();
                activityDeleted = true;
            }
        }

        // if the activity is in a subphase
        if (subphaseId) {
            const subphase = await Subphase.findById(subphaseId);
            if (!subphase) {
                return res.status(404).json({ message: 'Subphase not found' });
            }

            const initialLength = subphase.activities.length;
            subphase.activities = subphase.activities.filter(activity => activity.toString() !== activityId);

            if (subphase.activities.length !== initialLength) {
                await subphase.save();
                activityDeleted = true;
            }
        }

        if (!activityDeleted) {
            return res.status(404).json({ message: 'Activity not found in phase or subphase' });
        }

        // if the activity is deleted from a phase or subphase, delete the activity

        //we first save the id to delete the note description, and the input/output notes
        const activity = await Activity.findById(activityId);
        const descriptionNoteId = activity.description;
        const inputNoteId = activity.input;
        const outputNoteId = activity.output;

        //we first find the events linked to the activity and delete them
        const eventIds = activity.events;
        if (eventIds.length > 0) {
            await Event.deleteMany({ _id: { $in: eventIds } });
        }

        await Activity.findByIdAndDelete(activityId);

        //delete the description note
        if (descriptionNoteId) {
            await Note.findByIdAndDelete(descriptionNoteId);
        }
        //delete the input note
        if (inputNoteId) {
            await Note.findByIdAndDelete(inputNoteId);
        }
        //delete the output note
        if (outputNoteId) {
            await Note.findByIdAndDelete(outputNoteId);
        }

        return res.status(200).json({ success: true, message: "Activity deleted successfully" });

    } catch (error) {
        console.error('Error deleting activity:', error);
        return res.status(500).json({ message: error.message });
    }
};


module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject, removePhaseFromBackend, removeSubphaseFromBackend, removeActivityFromBackend };