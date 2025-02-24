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
        project.description = description;
        project.members = memberIds;

        // Update the phases and subphases
        const updatedPhaseIds = [];
        for (const phase of phases) {
            let existingPhase = await Phase.findOne({ _id: phase.id, project: project._id });

            if (existingPhase) {
                // if the phase exists, update it
                existingPhase.name = phase.name;
                // finds the exisiting activities
                const existingActivityIds = existingPhase.activities.map(activity => activity.toString());
                // finds the new activities (without an ID)
                const newActivities = phase.activities.filter(activity => !activity.id);
                // creates the new activities and returns their IDs
                const newActivityIds = await createActivities(newActivities, project._id, existingPhase._id, undefined, ownerUser._id);
                // Adds the new activities to the existing ones (without duplicates)
                existingPhase.activities = Array.from(new Set([...existingActivityIds, ...newActivityIds]));

                await existingPhase.save();

            } else {
                // if the phase does not exist, create it
                const newPhaseId = await createPhaseSubphase("phase", phase, project._id, ownerUser._id);
                existingPhase = await Phase.findById(newPhaseId);
            }

            // Updates the subphases
            const updatedSubphaseIds = [];
            for (const subphase of phase.subphases) {
                let existingSubphase = await Phase.findOne({ _id: subphase.id, project: project._id });

                if (existingSubphase) {
                    existingSubphase.name = subphase.name;

                    const existingActivityIds = existingSubphase.activities.map(activity => activity.toString());
                    const newActivities = subphase.activities.filter(activity => !activity.id);
                    const newActivityIds = await createActivities(newActivities, project._id, undefined, existingSubphase._id, ownerUser._id);
                    
                    // Adds the new activities to the existing ones (without duplicates)
                    existingSubphase.activities = Array.from(new Set([...existingActivityIds, ...newActivityIds]));

                    await existingSubphase.save();
                } else {
                    const newSubphaseId = await createPhaseSubphase("subphase", subphase, project._id, ownerUser._id);
                    existingSubphase = await Subphase.findById(newSubphaseId);
                }
                updatedSubphaseIds.push(existingSubphase._id);
            }

            existingPhase.subphases = updatedSubphaseIds;
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