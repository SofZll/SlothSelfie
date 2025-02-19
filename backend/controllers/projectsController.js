const Project = require("../models/projectModel");
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

//POST create a project
const createProject = async (req, res) => {
    const { title, description, owner, members, phases, subphases } = req.body;
    if (!title || !owner) {
        return res.status(400).json({ error: "Titolo e owner sono obbligatori" });
    }

    // finds the owner ID from the username
    const ownerUser = await User.findOne({ username: owner });
    if (!ownerUser) return res.status(404).json({ message: "Owner not found" });

    // finds the members IDs from the usernames
    const memberUsers = await User.find({ username: { $in: members } });
    const memberIds = memberUsers.map(user => user._id);


    try {
        const newProject = new Project({
            title,
            description,
            owner: ownerUser._id,
            members: memberIds || [],
            phases: phases || [],
            subphases: subphases || [],
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