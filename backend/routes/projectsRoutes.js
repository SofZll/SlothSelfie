const express = require("express");
const router = express.Router();

//TODO RISCRIVI TUTTO, PER ORA è MOCKUP

// Mock database per test
let projects = [
    { id: 1, title: "Progetto 1", owner: "User1" },
    { id: 2, title: "Progetto 2", owner: "User2" }
];

// GET gets all projects
router.get("/projects", (req, res) => {
    res.json(projects);
});

// POST creates a new project
router.post("/projects", (req, res) => {
    const { title, owner } = req.body;
    if (!title || !owner) {
        return res.status(400).json({ error: "Titolo e owner richiesti" });
    }
    const newProject = { id: projects.length + 1, title, owner };
    projects.push(newProject);
    res.status(201).json(newProject);
});

module.exports = router;
