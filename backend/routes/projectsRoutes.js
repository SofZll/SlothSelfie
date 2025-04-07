const express = require("express");

const {createProject, getAllProjects, getProjectById, getPhaseSubphaseById, updateProject, deleteProject, removePhaseFromBackend, removeSubphaseFromBackend, removeActivityFromBackend } = require("../controllers/projectsController");
const router = express.Router();


// projects endpoints
router.get('/projects', getAllProjects);
router.get('/project/:id', getProjectById);
router.get('/phaseSubphase/:id', getPhaseSubphaseById);
router.post('/project', createProject);
router.put('/project/:id', updateProject);
router.delete('/project/:id', deleteProject);
router.post('/project/:id/remove-phase', removePhaseFromBackend);
router.post('/project/:id/remove-subphase', removeSubphaseFromBackend);
router.post('/project/:id/remove-activity', removeActivityFromBackend);


module.exports = router;
