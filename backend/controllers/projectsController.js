const Project = require("../models/projectModel");
const Phase = require("../models/phaseModel");
const Subphase = require("../models/subphaseModel");
const Activity = require("../models/activityModel");
const User = require("../models/userModel");

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
        .populate("members", "username");
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        //now we get the phases of the project
        project.phases = await Phase.find({ project: id })
        .populate("subphases"); // Populate subphases of the phase

        //now we populate the activities of each phase
        for (const phase of project.phases) {
            phase.activities = await Activity.find({ phase: phase._id })
            .populate("sharedWith", "username");
        }

         // Populates activities of each subphase
        for (const phase of project.phases) {
            for (const subphase of phase.subphases) {
                subphase.activities = await Activity.find({ subphase: subphase._id })
                .populate("sharedWith", "username");
            }
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project by id:', error);
        res.status(500).json({ message: error.message });
    }
}

// Create the activities for the phase/subphase
const createActivities = async (activities, projectId, phaseId, subphaseId, ownerId) => {
    return await Promise.all(activities.map(async (activity) => {

        // Find the users to share the activity with
        const sharedWithUserIds = await User.find({ username: { $in: activity.sharedWith } });

        // Create the activity
        const newActivity = new Activity({
            title: activity.title,
            project: projectId,
            phase: phaseId,
            subphase: subphaseId,
            sharedWith: sharedWithUserIds,
            startDate: activity.startDate,
            deadline: activity.deadline,
            user: ownerId
        });

        const savedActivity = await newActivity.save();
        return savedActivity._id;
    }));
};

//POST create a phase or subphase and return its id
const createPhaseSubphase = async (type, phase, projectId, ownerId) => {
    let newPhase;

    if (type === "phase") {
        newPhase = new Phase({ title: phase.name, project: projectId });
    } else if (type === "subphase") {
        newPhase = new Subphase({ title: phase.name, project: projectId });
    } else {
        throw new Error("Invalid type: must be 'phase' or 'subphase'");
    }

    await newPhase.save(); // we save the new phase/subphase and we get its _id

    const activityIds = await createActivities(phase.activities, projectId, type === "phase" ? newPhase._id : undefined, type === "subphase" ? newPhase._id : undefined, ownerId);

    // We update the phase/subphase with the activities
    await newPhase.updateOne({ $push: { activities: { $each: activityIds } } });

    return newPhase._id;
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

        // Create the project
        const newProject = new Project({ title, owner: ownerUser._id, description, members: memberIds });
        await newProject.save();

        // Create the phases and subphases with their activities
        const phaseIds = [];
        for (const phase of phases) {
            const phaseId = await createPhaseSubphase("phase", phase, newProject._id, ownerUser._id);
            phaseIds.push(phaseId);

            const subphaseIds = [];
            for (const subphase of phase.subphases) {
                const subphaseId = await createPhaseSubphase("subphase", subphase, newProject._id, ownerUser._id);
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

//finds the activities to delete and daletes them, returns the updated activity IDs. Called in updateProject
const deleteRemovedActivities = async (newActivities, existingActivityIds) => {
    const updatedActivityIds = newActivities
                .filter(activity => activity._id)  // we only want the activities with an ID
                .map(activity => activity._id.toString());

                const activitiesToDelete = existingActivityIds.filter(id => !updatedActivityIds.includes(id));
                console.log("Activities to delete:", activitiesToDelete);

                //delete the activities
                if (activitiesToDelete.length > 0) {
                    await Activity.deleteMany({ _id: { $in: activitiesToDelete } });
                }

                return updatedActivityIds;

};

//PUT update a project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, owner, members, phases } = req.body;

        console.log("phases from frontend:", phases);

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
        project.description = description;
        project.members = memberIds;

        //find the existing phases
        const existingPhases = await Phase.find({ project: project._id });
        const existingPhaseIds = existingPhases.map(phase => phase._id.toString());
        console.log('existingPhaseIds:', existingPhaseIds);

        // Update the phases and subphases
        const updatedPhaseIds = [];
        for (const phase of phases) {
            
            console.log("Checking phase:", phase._id, "for project:", project._id);

            let existingPhase = await Phase.findOne({ _id: phase._id, project: project._id });
            console.log('existingPhase:', existingPhase);

            if (existingPhase) {
                console.log("Phase found, updating:", existingPhase);

                // if the phase exists, update it
                existingPhase.name = phase.name;
                // finds the exisiting activities
                const existingActivityIds = existingPhase.activities
                .filter(activity => activity._id)  // we only want the activities with an ID
                .map(activity => activity._id.toString());
                // finds the new activities (without an ID)
                const newActivities = phase.activities.filter(activity => !activity._id);
                // creates the new activities and returns their IDs
                const newActivityIds = await createActivities(newActivities, project._id, existingPhase._id, undefined, ownerUser._id);
                // Adds the new activities to the existing ones (without duplicates)
                existingPhase.activities = Array.from(new Set([...existingActivityIds, ...newActivityIds]));

                //finds the activities to delete and return the updated activity IDs
                const updatedActivityIds = await deleteRemovedActivities(phase.activities, existingActivityIds);
                existingPhase.activities = updatedActivityIds.concat(newActivityIds);
                //save the updated phase
                await existingPhase.save();

            } else {
                // if the phase does not exist, create it
                const newPhaseId = await createPhaseSubphase("phase", phase, project._id, ownerUser._id);
                existingPhase = await Phase.findById(newPhaseId);
            }

            // Updates the subphases
            const updatedSubphaseIds = [];
            for (const subphase of phase.subphases) {
                let existingSubphase = await Phase.findOne({ _id: subphase._id, project: project._id });
                console.log('existingSubphase:', existingSubphase);

                if (existingSubphase) {
                    existingSubphase.name = subphase.name;

                    const existingActivityIdsSub = existingSubphase.activities.map(activity => activity.toString());
                    const newActivities = subphase.activities.filter(activity => !activity._id);
                    const newActivityIds = await createActivities(newActivities, project._id, undefined, existingSubphase._id, ownerUser._id);

                    // Adds the new activities to the existing ones (without duplicates)
                    existingSubphase.activities = Array.from(new Set([...existingActivityIds, ...newActivityIds]));

                    //finds the activities to delete
                    const updatedActivityIds = await deleteRemovedActivities(subphase.activities, existingActivityIdsSub);
                    existingSubphase.activities = updatedActivityIds.concat(newActivityIds);
                    //save the updated subphase
                    await existingSubphase.save();

                } else {
                    const newSubphaseId = await createPhaseSubphase("subphase", subphase, project._id, ownerUser._id);
                    existingSubphase = await Subphase.findById(newSubphaseId);
                }
                updatedSubphaseIds.push(existingSubphase._id);

                /*
                //finds the removed subphases
                const existingSubphaseIds = existingPhase.subphases.map(subphase => subphase.toString());
                const subphasesToDelete = existingSubphaseIds.filter(id => !updatedSubphaseIds.includes(id));
                
                console.log("Subphases to delete:", subphasesToDelete);
                //delete the subphases
                if (subphasesToDelete.length > 0) {
                    await Activity.deleteMany({ subphase: { $in: subphasesToDelete } });
                    await Subphase.deleteMany({ _id: { $in: subphasesToDelete } });
                }*/

            }

            existingPhase.subphases = updatedSubphaseIds;
            await existingPhase.save();
            updatedPhaseIds.push(existingPhase._id.toString());
        }

        // Delete the phases that were removed, with their activities and subphases
        const phasesToDelete = existingPhaseIds.filter(phaseId => !updatedPhaseIds.includes(phaseId));
        console.log("Phases to delete:", phasesToDelete);

        if (phasesToDelete.length > 0) {
            // Find the subphases of the phase to delete //QUI PROBLEMI, le sottofasi risultano vuote!
            //const subphasesToDelete = await Subphase.find({ phase: { $in: phasesToDelete } }).select('_id');
            //const subphaseIdsToDelete = subphasesToDelete.map(subphase => subphase._id.toString());

            // Find the subphases of the phase to delete
            const phasesToDeleteWithSubphases = await Phase.find({ _id: { $in: phasesToDelete } });//.populate('subphases');
            console.log("Phases to delete with subphases:", phasesToDeleteWithSubphases);
                        
            //console.log("Subphases to delete:", subphasesToDelete);

            // Iterate over the phases and delete the subphases and activities
            for (const phase of phasesToDeleteWithSubphases) {
                const subphasesToDelete = phase.subphases;
                console.log("Subphases to delete:", subphasesToDelete);

                // Delete the activities associated with the subphases
                if (subphasesToDelete.length > 0) {
                    const subphaseIdsToDelete = subphasesToDelete.map(subphase => subphase._id);
                    await Activity.deleteMany({ subphase: { $in: subphaseIdsToDelete } });
                }

                // Delete the subphases
                if (subphasesToDelete.length > 0) {
                    await Subphase.deleteMany({ _id: { $in: subphasesToDelete.map(subphase => subphase._id) } });
                }
            }

            // delete the activities associated with the phases
            await Activity.deleteMany({ phase: { $in: phasesToDelete } });

            // delete the phases
            await Phase.deleteMany({ _id: { $in: phasesToDelete } });
        }

        /*
        //Delete the subphases that were removed with their activities
        const existingSubphases = await Subphase.find({ project: project._id });
        const existingSubphaseIds = existingSubphases.map(subphase => subphase._id.toString());
        console.log('existingSubphaseIds:', existingSubphaseIds);

        const updatedSubphaseIds = [];
        for (const phase of phases) {
            for (const subphase of phase.subphases) {
                updatedSubphaseIds.push(subphase._id.toString());
            }
        }

        const subphasesToDelete = existingSubphaseIds.filter(subphaseId => !updatedSubphaseIds.includes(subphaseId));
        console.log("Subphases to delete:", subphasesToDelete);

        if (subphasesToDelete.length > 0) {
            // Delete the activities associated with the subphases
            await Activity.deleteMany({ subphase: { $in: subphasesToDelete } });

            // Delete the subphases
            await Subphase.deleteMany({ _id: { $in: subphasesToDelete } });
        }
        */
        // Update the project with the updated phases
        project.phases = updatedPhaseIds;
        await project.save();

        res.status(200).json({ message: 'Project updated successfully', project });

    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: "Server error while updating project" });
    }
};

//DELETE a project
const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
            //delete associated phases and activities
            await Phase.deleteMany({ project: id });
            await Subphase.deleteMany({ project: id });
            await Activity.deleteMany({ project: id });

            res.status(200).send("Project and associated data deleted successfully.");
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };