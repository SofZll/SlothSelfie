const express = require("express");

const {createProject, getAllProjects, getProjectById, updateProject, deleteProject, removePhaseFromBackend, removeSubphaseFromBackend, removeActivityFromBackend } = require("../controllers/projectsController");
const router = express.Router();


// projects endpoints
router.get('/projects', getAllProjects);
router.get('/project/:id', getProjectById);
router.post('/project', createProject);
router.put('/project/:id', updateProject);
router.delete('/project/:id', deleteProject);
router.post('/project/:id/remove-phase', removePhaseFromBackend);
router.post('/project/:id/remove-subphase', removeSubphaseFromBackend);
router.post('/project/:id/remove-activity', removeActivityFromBackend);


module.exports = router;
