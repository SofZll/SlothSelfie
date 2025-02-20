const Project = require("../models/projectModel");
const Phase = require("../models/phaseModel");
const Subphase = require("../models/subphaseModel");
const Activity = require("../models/activityModel");
const User = require("../models/userModel");

//GET all projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
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
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project by id:', error);
        res.status(500).json({ message: error.message });
    }
}


//POST create a phase or subphase and return its id TODO PROBLEMA IN SALVATAGGIO DI SOTTTOFASI IN DB ASSOCIATE AD UNA FASE
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

    // Create the activities for the phase/subphase
    const activityIds = await Promise.all(
        phase.activities.map(async (activity) => {

            console.log("activity.type:", activity.type);
            console.log("activity.sharedWith:", activity.sharedWith);

            // Find the users to share the activity with
            const sharedWithUserIds = await User.find({ username: { $in: activity.sharedWith } })

            // Create the activity
            const newActivity = new Activity({
                title: activity.title,
                project: projectId,
                phase: type === "phase" ? newPhase._id : undefined,
                subphase: type === "subphase" ? newPhase._id : undefined,
                sharedWith: sharedWithUserIds,
                startDate: activity.startDate,
                deadline: activity.deadline,
                type: activity.type,
                user: ownerId
            });

            const savedActivity = await newActivity.save();
            return savedActivity._id;
        })
    );

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

            await Phase.findByIdAndUpdate(phaseId, { $push: { subphases: { $each: subphaseIds } } });
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
    const { id } = req.params;
    const { title, description, owner, members, phases, subphases } = req.body;
    try {
        const project = await Project
            .findByIdAndUpdate(id, {
                title, description, owner, members, phases, subphases
            }, { new: true });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: error.message });
    }
}

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