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

//POST create a phase or subphase and return its id
const createPhaseSubphase = async (type, phase) => {
    let newPhase;
    
    if (type === 'phase') {
        newPhase = new Phase({ title: phase.name, activities: phase.activities });
    } else if (type === 'subphase') {
        newPhase = new Subphase({ title: phase.name, activities: phase.activities });
    } else {
        throw new Error("Invalid type: must be 'phase' or 'subphase'");
    }

    await newPhase.save();
    return newPhase._id;
};

//POST create a project ma TODO: non salva le activities :(
const createProject = async (req, res) => {
    try{
        const { title, description, owner, members, phases, subphases } = req.body;
        if (!title || !owner) {
            return res.status(400).json({ error: "Titolo e owner sono obbligatori" });
        }

        // finds the owner ID from the username
        const ownerUser = await User.findOne({ username: owner });
        if (!ownerUser) {
            return res.status(404).json({ message: "Owner not found" });
        }

        // finds the members IDs from the usernames
        const memberUsers = await User.find({ username: { $in: members } });
        const memberIds = memberUsers.map(user => user._id);

        //if there are phases, create them an get the IDs
        const savedPhases = phases ? await Promise.all(phases.map(phase => createPhaseSubphase('phase', phase))) : [];
        //if there are subphases, create them an get the IDs
        const savedSubphases = subphases ? await Promise.all(subphases.map(subphase => createPhaseSubphase('subphase', subphase))) : [];


        const newProject = new Project({
            title,
            description,
            owner: ownerUser._id,
            members: memberIds || [],
            phases: savedPhases || [],
            subphases: savedSubphases || [],
        });

        console.log('New project:', newProject);

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: error.message });
    }
}

//POST create a phase or subphase and return its id (approccio diverso ma per ora non va)
const createPhaseSubphase2 = async (type, phase, projectId) => {
    let newPhase;

    if (type === "phase") {
        newPhase = new Phase({ title: phase.name, project: projectId });
    } else if (type === "subphase") {
        newPhase = new Subphase({ title: phase.name, project: projectId });
    } else {
        throw new Error("Invalid type: must be 'phase' or 'subphase'");
    }

    await newPhase.save(); // Salviamo la fase o sottofase e otteniamo il suo _id

    // Creiamo le attività collegate alla fase o sottofase
    const activityPromises = phase.activities.map(async (activity) => {
        const newActivity = new Activity({
            title: activity.name,
            project: projectId, // Associa l'attività al progetto
            phase: type === "phase" ? newPhase._id : undefined,
            subphase: type === "subphase" ? newPhase._id : undefined,
            assignedTo: activity.members,
            startDate: activity.startDate,
            deadline: activity.endDate,
        });

        return await newActivity.save();
    });

    await Promise.all(activityPromises); // Aspettiamo che tutte le attività siano salvate

    return newPhase._id; // Ritorniamo l'ID della fase/sottofase
};

//POST create a project (non va, approccio diverso?)
const createProject2 = async (req, res) => {
    try {
        const { title, owner, description, members, phases } = req.body;

        // Creiamo il progetto
        const newProject = new Project({ title, owner, description, members });
        await newProject.save();

        // Creiamo fasi, sottofasi e attività
        for (const phase of phases) {
            const phaseId = await createPhaseSubphase("phase", phase, newProject._id);

            for (const subphase of phase.subphases) {
                await createPhaseSubphase("subphase", subphase, newProject._id);
            }
        }

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
        res.status(204).json();
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };