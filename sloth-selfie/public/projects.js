//TODO: QUANDO TRASFERISCI SUL SERVER CAMBIA I PATH DEI FETCH nei file projects.js, projectsView.js, projectsHandleActivities.js, projectsHandleActivitiesUtils.js

//(es di link ad un file online, es: https://example.com/files/note.txt) V 

// Function to get the logged user username
async function getLoggedUser() {
    try {
        const response = await fetch("https://site232453.tw.cs.unibo.it/api/user/profile", {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();

        if (data.success && data.user) {
            return data.user.username; // resolve with the username of the logged user
        } else {
            console.warn("No user logged in.");
            return null; // resolve with null if no user is logged in
        }
    } catch (error) {
        console.error("Error while getting logged user:", error);
        throw error; // reject with the error
    }
}

//GET, function to load projects from the server
async function loadProjects() {

    const userLogged = await getLoggedUser();

    //adds loading message and spinner
    const list = document.getElementById("projects-list");
    list.innerHTML = `<div class="loading-container">
                        <div class="spinner"></div>
                        <p>Loading, please wait...</p>
                    </div>`;
    try {
        const response = await fetch(`https://site232453.tw.cs.unibo.it/api/projects`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error('Error fetching projects');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch projects');
        }

        const projects = data.projects;
        
        const list = document.getElementById("projects-list");
        list.innerHTML = ""; // clear the list before loading the projects

        projects.forEach(project => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `
                <strong>${project.title}</strong> - Owner: ${project.owner.username} - Members: ${project.members.map(m => m.username).join(", ")}<br>
                 ${
                    project.owner.username === userLogged // Only the owner can edit or delete the project
                    ? `<button type="button" aria-label="Delete-project" class="btn btn-info btn-sm ml-2 btn-form-1" onclick="deleteProject('${project._id}')">Delete Project</button>
                       <button type="button" aria-label="Edit-project" class="btn btn-info btn-sm ml-2 btn-form-1" onclick="editProject('${project._id}')">Edit Project</button>` 
                    : ''
                }
                <button type="button" aria-label="handleActivities" class="btn btn-warning btn-sm ml-2 btn-form-3" onclick="handleActivities('${project._id}')">Handle Activities</button>
                <button type="button" aria-label="View-list" class="btn btn-outline-primary btn-sm btn-view view-list" onclick="viewAsList('${project._id}')">View as List</button>
                <button type="button" aria-label="View-gantt" class="btn btn-outline-primary btn-sm btn-view view-gantt" onclick="viewAsGantt('${project._id}')">View as Gantt</button>
            `;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error while loading projects:", error);
    }
}

//Function to extract activity data from the form, used in saveOrUpdateProject
function extractActivityData(activityDiv) {
    const activityId = activityDiv.getAttribute("data-activity-id");

    // Get the members of the activity
    const membersCheckboxes = activityDiv.querySelectorAll('input[name="activity-actors"]:checked');
    const members = Array.from(membersCheckboxes).map(cb => cb.value);

    // Get the dependencies of the activity
    const dependenciesCheckboxes = activityDiv.querySelectorAll('input[name="activity-dependencies"]:checked');
    const dependencies = Array.from(dependenciesCheckboxes).map(cb => cb.value);

    // Get start and end date values
    const startDate = activityDiv.querySelector(".activity-start").value;
    let deadline = activityDiv.querySelector(".activity-end").value;

    // If the deadline is before the start date, set it equal to the start date
    if (startDate && deadline && new Date(deadline) < new Date(startDate)) {
        deadline = startDate; // Set deadline to the same as start date
    }

    return {
        _id: activityId ? activityId : undefined,
        title: activityDiv.querySelector(".activity-name").value,
        description: activityDiv.querySelector(".activity-description").value,
        sharedWith: members,
        startDate: startDate,
        deadline: deadline,
        milestone: activityDiv.querySelector(".activity-milestone").checked,
        dependencies: dependencies
    };
}

//Function to save a new or edited project
async function saveOrUpdateProject(event) {
    event.preventDefault();

    //disable the button while saving
    document.getElementById("createSave").disabled = true;
    // Show a saving message
    document.getElementById("alertMessage").style.display = "block";
     // Get the project id if we are editing a project
    const projectId = document.getElementById("projectForm").getAttribute("data-project-id");

    const project = {
        title: document.getElementById("projectName").value,
        owner: document.getElementById("projectOwner").value,
        description: document.getElementById("projectDesc").value,
        members: document.getElementById("projectActors").value.split(",").map(a => a.trim()),
        phases: []
    };

    document.querySelectorAll("#phasesContainer > .card").forEach(phaseDiv => {
        // Get the phase id if we are editing a project
        const phaseId = phaseDiv.getAttribute("data-phase-id");
        const phase = {
            _id: phaseId ? phaseId : undefined,
            title: phaseDiv.querySelector(".phase-name").value,
            macroActivity: {},
            activities: [],
            subphases: []
        };

        // Get the macroactivity id if we are editing a project
        const macroActivityId = phaseDiv.querySelector(".macro-activities").getAttribute("data-macroactivity-id");

        const macroactivity = {
            _id: macroActivityId ? macroActivityId : undefined,
            title: phaseDiv.querySelector(".macro-activity-name").value,
            description: phaseDiv.querySelector(".macro-activity-description").value,
            startDate: phaseDiv.querySelector(".macro-activity-start").value,
            deadline: phaseDiv.querySelector(".macro-activity-end").value,
        };
        phase.macroActivity = macroactivity; // Assign the macroactivity to the phase

        phaseDiv.querySelectorAll(".activities > .border").forEach(activityDiv => {
            phase.activities.push(extractActivityData(activityDiv)); 
        });

        phaseDiv.querySelectorAll(".subphases > .border").forEach(subPhaseDiv => {
            // Get the subphase id if we are editing a project
            const subPhaseId = subPhaseDiv.getAttribute("data-subphase-id");
            const subphase = {
                _id: subPhaseId ? subPhaseId : undefined,
                title: subPhaseDiv.querySelector(".subphase-name").value,
                macroActivity: {},
                activities: []
            };

            // Get the macroactivity id if we are editing a project
            const subMacroActivityId = subPhaseDiv.querySelector(".subphase-macro-activities").getAttribute("data-macroactivity-id");

            const submacroactivity = {
                _id: subMacroActivityId ? subMacroActivityId : undefined,
                title: subPhaseDiv.querySelector(".macro-activity-name").value,
                description: subPhaseDiv.querySelector(".macro-activity-description").value,
                startDate: subPhaseDiv.querySelector(".macro-activity-start").value,
                deadline: subPhaseDiv.querySelector(".macro-activity-end").value,
            };
            subphase.macroActivity = submacroactivity; // Assign the macroactivity to the subphase

            subPhaseDiv.querySelectorAll(".subphase-activities > .border").forEach(activityDiv => {
                subphase.activities.push(extractActivityData(activityDiv));
            });

            phase.subphases.push(subphase);
        });

        project.phases.push(phase);
    });

    try {
        let response;
        if (projectId) {
            // Update the existing project, PUT
            response = await fetch(`https://site232453.tw.cs.unibo.it/api/project/${projectId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify(project),
            });
        } else {
            // Save the new project, POST
            response = await fetch(`https://site232453.tw.cs.unibo.it/api/project`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify(project),
            });
        }

        const data = await response.json();

        if (response.ok) {
            Swal.fire({title: "Success!", text: projectId ? "Project updated successfully!" : "Project saved successfully!", icon: "success"});
            resetForm();
            await loadProjects();
            //eventually close the list/gantt view and the handle activities form
            document.getElementById("project-view-container").style.display = "none";
            document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close view button
            document.getElementById("activity-container").style.display = "none";
            document.getElementById("closeActivityViewBtn").style.display = "none"; // Hides the close view button

        } else {
            console.error("Error saving/updating project:", data.message);
        }

    } catch (error) {
        console.error("Error saving/updating project:", error);
    }

    // hide the saving message
    document.getElementById("alertMessage").style.display = "none";

    //enable the button after saving
    document.getElementById("createSave").disabled = false;

    // Remove the warning message after saving
    const warningMessage = document.getElementById("dependencyWarning");
    if (warningMessage) {
        warningMessage.remove();
    }

    document.getElementById("phasesContainer").innerHTML = "";//we remove the phase and subphase empty form after saving
    document.getElementById("projectForm").style.display = "none"; // hides the form after saving
    document.getElementById("ToggleFormBtn").textContent = "+ Add a Project"; //the button text is changed to "Add a Project" after saving
    resetForm();
    await loadProjects(); // Reload the projects list
}

//functions to add phases, subphases, macroactivities and activities to the project form for the frontend

let phaseCounter = 0; //local counter for the phases
// Add a new phase to the project
function addPhase() {
    const phases = document.querySelectorAll("#phasesContainer .card");
    const phaseNumber = phases.length + 1;  //sets the number of the phase considering the other phases in the form
    const phaseDiv = document.createElement("div");
    phaseDiv.classList.add("card", "p-3", "mt-3");
    phaseDiv.innerHTML = `
        <h5>Phase ${phaseNumber}</h5>
        <label>Phase name:</label>
        <input type="text" class="form-control phase-name" required>
        <div class="macro-activities mt-2"></div> <!-- container macro activities of the phase -->
        <button type="button" aria-label="Add-activity" class="btn btn-warning mt-2 btn-form-3" onclick="addActivity(this, 'phase')">Add activity</button>
        <div class="activities mt-2"></div> <!-- container activities of the phase -->
        <button type="button" aria-label="Add-subphase" class="btn btn-info mt-2 btn-form-2" onclick="addSubPhase(this)">Add subphase</button>
        <div class="subphases mt-2"></div> <!-- Container subphases -->
        <button type="button" aria-label="Remove-phase" class="btn btn-danger mt-2 btn-form-1" onclick="removeElement(this)">Remove Phase</button>
    `;
    document.getElementById("phasesContainer").appendChild(phaseDiv);

    //we create the associated macrophase for the phase
    addMacroActivity(phaseDiv, "phase");

    return phaseDiv; //used for the edit function
}

// Add a new subphase to the project
function addSubPhase(button) {
    const subPhaseContainer = button.nextElementSibling;
    const subPhaseDiv = document.createElement("div");
    subPhaseDiv.classList.add("border", "p-2", "mt-2");
    subPhaseDiv.innerHTML = `
        <label>Subphase name:</label>
        <input type="text" class="form-control subphase-name" required>
        <div class="subphase-macro-activities mt-2"></div> <!-- container macro activities of the subphase -->
        <button type="button" aria-label="Add-activity" class="btn btn-warning mt-2 btn-form-3" onclick="addActivity(this, 'subphase')">Add activity</button>
        <div class="subphase-activities mt-2"></div> <!-- Container activities of the subphase -->
        <button type="button" aria-label="Remove-subphase" class="btn btn-danger mt-2 btn-form-2" onclick="removeElement(this)">Remove Subphase</button>
    `;
    subPhaseContainer.appendChild(subPhaseDiv);

    //we create the associated macrophase for the subphase
    addMacroActivity(subPhaseDiv, "subphase");
}

// Add a new macro activity to the project
function addMacroActivity(button, type) {
    let activityContainer;

    // Default min/max date values (only used for subphase macroactivities, they depend on macroactivity of the phase date range)
    let minDate = "";
    let maxDate = "";

    // if it is a phase, we find the container of the macro activities of the phase
    if (type === "phase") {
        activityContainer = button.querySelector(".macro-activities");
    } else {// if it is a subphase, we find the container of the macro activities of the subphase
        activityContainer = button.querySelector(".subphase-macro-activities");

        // find the phase div of the subphase
        const phaseDiv = button.closest(".card");

        // find the start and end date of the macroactivity of the phase
        const phaseStartInput = phaseDiv.querySelector(".macro-activity-start");
        const phaseEndInput = phaseDiv.querySelector(".macro-activity-end");

        if (phaseStartInput && phaseEndInput) {
            minDate = phaseStartInput.value;
            maxDate = phaseEndInput.value;
        }
    }

    const activityDiv = document.createElement("div");
    activityDiv.classList.add("border", "p-2", "mt-2");
    activityDiv.innerHTML = `
        <label>Macro Activity name:</label>
        <input type="text" class="form-control macro-activity-name" required>
        <label>Macro Activity description (optional):</label>
        <textarea class="form-control macro-activity-description"></textarea>
        <label>Start date:</label>
        <input type="date" class="form-control macro-activity-start" required min="${minDate}" max="${maxDate}">
        <label>Deadline:</label>
        <input type="date" class="form-control macro-activity-end" required min="${minDate}" max="${maxDate}">
        </br>
    `;
    activityContainer.appendChild(activityDiv);
}

// Adds an activity to a phase or a subphase
function addActivity(button, type) {
    let macroActivityContainer;
    let activityContainer;

    if (type === "phase") {
        // finds the container of the activities of the phase and of the macroactivity
        macroActivityContainer = button.parentElement.querySelector(".macro-activities");
        activityContainer = button.parentElement.querySelector(".activities");
    } else {
        // finds the container of the activities of the subphase and of the macroactivity
        macroActivityContainer = button.parentElement.querySelector(".subphase-macro-activities");
        activityContainer = button.parentElement.querySelector(".subphase-activities");
    }

    // finds the macroactivity of the phase or subphase, the range of the activity is between the start and end date of the macroactivity
    const macroActivity = macroActivityContainer?.querySelector("div");

    let macroStart = "", macroEnd = "";
    if (macroActivity) {
        macroStart = macroActivity.querySelector(".macro-activity-start")?.value;
        macroEnd = macroActivity.querySelector(".macro-activity-end")?.value;
    }

    // Gets all project actors to fill the members field
    let projectActorsInput = document.querySelector("#projectActors").value.trim();
    let projectActors = projectActorsInput ? projectActorsInput.split(",").map(actor => actor.trim()) : [];

    // Gets all project activities for selecting dependencies, we only show the ones that are already saved with an id from the backend
    const allActivities = Array.from(document.querySelectorAll(".border[data-activity-id]")) 
        .filter(activityDiv => activityDiv.getAttribute("data-activity-id"));

    const activityDiv = document.createElement("div");
    activityDiv.classList.add("border", "p-2", "mt-2");
    activityDiv.innerHTML = `
        <label>Activity name:</label>
        <input type="text" class="form-control activity-name" required>
        <label>Activity description (optional):</label>
        <textarea class="form-control activity-description"></textarea>
        <label>Members:</label>
        <div class="activity-actors-checkboxes">
            ${projectActors.map(actor => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="activity-actors" value="${actor}" checked>
                    <label class="form-check-label">${actor}</label>
                </div>
            `).join("")}
        </div>
        <label>Start date:</label>
        <input type="date" class="form-control activity-start" required min="${macroStart}" max="${macroEnd}">
        <label>Deadline:</label>
        <input type="date" class="form-control activity-end" required min="${macroStart}" max="${macroEnd}">
        <label>Is a milestone:</label>
        <input type="checkbox" class="activity-milestone">
        </br>
        <label>Dependencies:</label>
        <div class="activity-dependencies-checkboxes">
            ${allActivities.map(activity => {
                const activityId = activity.getAttribute("data-activity-id");
                const activityName = activity.querySelector(".activity-name").value;
                return `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="activity-dependencies" value="${activityId}">
                        <label class="form-check-label">${activityName}</label>
                    </div>
                `;
            }).join("")}
        </div>

        </br>
        <button type="button" aria-label="Remove-activity" class="btn btn-danger mt-2 btn-form-3" onclick="closeActivityForm(this)">Remove Activity</button>
    `;
    activityContainer.appendChild(activityDiv);
}

// function to remove a phase or subphase while editing the project form
async function removeElement(button) {
    const element = button.parentElement;

    // gets the IDs of the project from the data attribute of the form
    let projectId = document.getElementById("projectForm").getAttribute("data-project-id");

    // Get the phase or subphase ID from the element
    let phaseId = element.getAttribute("data-phase-id");
    let subphaseId = element.getAttribute("data-subphase-id");

    // if we remove a phase, we update the counter
    if (element.classList.contains("card")) {
        // removes the phase from UI
        element.remove();
        // Removes the phase from the backend if it has an ID
        if (phaseId) {
            await removePhaseFromBackend(projectId, phaseId);
        } 
        updatePhaseNumbers();// Renumerates the phases left

    } else {// if it is a subphase
         // removes the subphase from UI
        element.remove();

        // Removes the subphase from the backend if it has an ID
        if (subphaseId) {
       
            // if it is a subphase, we get the parent phase from data-parent-phase-id
            phaseId = element.getAttribute("data-parent-phase-id");

            // removes the subphase from UI
            element.remove();
            // Removes the subphase from the backend
            await removeSubphaseFromBackend(projectId, phaseId, subphaseId);
        }
    }
}

//Function to remove an activity while editing the project form
async function closeActivityForm(button) {
    const activityDiv = button.parentElement;

    // gets the IDs of the project from the data attribute of the form
    let projectId = document.getElementById("projectForm").getAttribute("data-project-id");

    // gets the IDs of the parent phase or subphase from the data-attributes
    let phaseId = activityDiv.getAttribute("data-parent-phase-id") || null;
    let subphaseId = activityDiv.getAttribute("data-parent-subphase-id") || null;

    // gets the activity ID from the data-attribute
    let activityId = activityDiv.getAttribute("data-activity-id") || null;

     //removes the activity from the UI
     activityDiv.remove();

    // removes the activity from the backend if it has an ID
    if (activityId) {
        await removeActivityFromBackend(projectId, phaseId, subphaseId, activityId);
    }
}

// function to remove a phase from the backend
async function removePhaseFromBackend(projectId, phaseId) {
    try {
        const response = await fetch(`https://site232453.tw.cs.unibo.it/api/project/${projectId}/remove-phase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId })
        });

        const data = await response.json();

        if (data.success) {
            console.log("Phase removed successfully:", data.message); 
        } else {
            Swal.fire({title: "Error", text: "Error while deleting subphase", icon: "error"});
        }
        
    } catch (error) {
        console.error('Errore:', error);
    }
}

// function to remove a subphase from the backend
async function removeSubphaseFromBackend(projectId, phaseId, subphaseId) {
    try {
        const response = await fetch(`https://site232453.tw.cs.unibo.it/api/project/${projectId}/remove-subphase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId, subphaseId })
        });

        const data = await response.json();

        if (data.success) {
            console.log("Subphase removed successfully:", data.message);
        } else {
            Swal.fire({title: "Error", text: "Error while deleting subphase", icon: "error"});
            
        }
    } catch (error) {
        console.error('Errore:', error);
    }
}

//function to remove an activity from the backend
async function removeActivityFromBackend(projectId, phaseId, subphaseId, activityId) {
    try {
        const response = await fetch(`https://site232453.tw.cs.unibo.it/api/project/${projectId}/remove-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId, subphaseId, activityId })
        });

        const data = await response.json();

        if (data.success) {
            console.log("Activity removed successfully:", data.message);
        } else {
            Swal.fire({title: "Error", text: "Error while deleting the activity", icon: "error"});

        }
    } catch (error) {
        console.error('Errore:', error);
    }
}

//after a remove it updates the number sequence of the phases
function updatePhaseNumbers() {
    const phases = document.querySelectorAll("#phasesContainer .card h5");
    phases.forEach((title, index) => {
        title.textContent = `Fase ${index + 1}`;
    });
}

//function to delete a project, with all phases, subphases and activities
async function deleteProject(projectId) {
    if (confirm("Are you sure you want to delete this project?")) {

        // DELETE request to remove the project
        try {
            const response = await fetch(`https://site232453.tw.cs.unibo.it/api/project/${projectId}`, {
                method: "DELETE",
                credentials: 'include',
            });

            if (response.ok) {
                Swal.fire({title: "Success!", text: "Project deleted successfully!", icon: "success"});
                
                // Close the project view if the project is deleted
                document.getElementById("project-view-container").style.display = "none";
                document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close button
                
                await loadProjects(); // Reload the projects list after deletion
                //eventually close the list/gantt view, the handle activities and the edit form
                document.getElementById("project-view-container").style.display = "none";
                document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close view button
                document.getElementById("activity-container").style.display = "none";
                document.getElementById("closeActivityViewBtn").style.display = "none"; // Hides the close view button
                document.getElementById("phasesContainer").innerHTML = "";//we remove the phase and subphase empty form after saving
                document.getElementById("projectForm").style.display = "none";
                document.getElementById("ToggleFormBtn").textContent = "+ Add a Project";
                //we also remove the warning message if it is there
                let warningMessage = document.getElementById("dependencyWarning");
                if (warningMessage) {
                    warningMessage.remove();
                }
                resetForm();
            } else {
                Swal.fire({title: "Error", text: "Error while deleting the project.", icon: "error"});
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    }
}

//function to fill the macroactivity of a project while editing it
function fillMacroActivityFields(macroActivityDiv, macroActivity, parentId, parentType) {

    //Adds the macroactivity ID directly to the div
    macroActivityDiv.setAttribute("data-macroactivity-id", macroActivity._id);
    //we also add the parent phase ID to the macroactivity div
    macroActivityDiv.setAttribute(`data-parent-${parentType}-id`, parentId);

    macroActivityDiv.querySelector(".macro-activity-name").value = macroActivity.title;
    macroActivityDiv.querySelector(".macro-activity-description").value = macroActivity.description.content;
    macroActivityDiv.querySelector(".macro-activity-start").value = formatDateForInput(macroActivity.startDate);
    macroActivityDiv.querySelector(".macro-activity-end").value = formatDateForInput(macroActivity.deadline);
}

//Function to fill the activities of a project while editing it
function fillActivityFields(activityDiv, activity, projectActors, parentId, parentType) {
    //Adds the activity ID directly to the div
    activityDiv.setAttribute("data-activity-id", activity._id);
    //we also add the parent phase ID to the activity div
    activityDiv.setAttribute(`data-parent-${parentType}-id`, parentId);

    activityDiv.querySelector(".activity-name").value = activity.title;
    activityDiv.querySelector(".activity-description").value = activity.description.content;

    //Fill the checkboxes with the members of the project
    const actorUsernames = activity.sharedWith.map(a => a.username);
    const checkboxes = activityDiv.querySelectorAll('input[name="activity-actors"]');

    checkboxes.forEach(cb => {
        cb.checked = actorUsernames.includes(cb.value);
    });

    activityDiv.querySelector(".activity-start").value = formatDateForInput(activity.startDate);
    activityDiv.querySelector(".activity-end").value = formatDateForInput(activity.deadline);
    activityDiv.querySelector(".activity-milestone").checked = activity.milestone;

    // We need to select the saved dependencies in the checkboxes
    const savedDependencyIds = activity.dependencies.map(dep => dep._id);
    const dependencyCheckboxes = activityDiv.querySelectorAll('input[name="activity-dependencies"]');

    dependencyCheckboxes.forEach(cb => {
        cb.checked = savedDependencyIds.includes(cb.value);
    });
}

//function to fill the form and edit a project
async function editProject(projectId) {
    try {
        const response = await fetch(`https://site232453.tw.cs.unibo.it/api/project/${projectId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch project data');
        }
        const project = data.project;

        // fill the form with the project data
        
        //adding a note for the user
        const projectForm = document.getElementById("projectForm");

        let existingNote = document.getElementById("dependencyWarning");
        if (!existingNote) {
            const warningMessage = document.createElement("p");
            warningMessage.id = "dependencyWarning";
            warningMessage.textContent = "Note: New activities will only be available as dependencies after saving them with the project.";
            warningMessage.style.color = "blue";
            projectForm.parentNode.insertBefore(warningMessage, projectForm);
        }

        //we set the project ID in the form with the attribute data-project-id
        document.getElementById("projectForm").setAttribute("data-project-id", projectId);
        document.getElementById("projectName").value = project.title;
        document.getElementById("projectOwner").value = project.owner.username;
        document.getElementById("projectDesc").value = project.description.content;
        // Save the project members in the form
        const projectActors = project.members.map(m => m.username);
        document.getElementById("projectActors").value = projectActors.join(", ");

        // reset the phases container and reload the phases
        const phasesContainer = document.getElementById("phasesContainer");
        phasesContainer.innerHTML = "<h4>Phases</h4>";
        project.phases.forEach(phase => {
            let phaseElement = addPhase(phase);

            // Adds the phase ID directly to the div
            phaseElement.setAttribute("data-phase-id", phase._id);

            //fill the name of each phase
            phaseElement.querySelector(".phase-name").value = phase.title;

            // fill the macroactivity of each phase
            const macroActivityDiv = phaseElement.querySelector(".macro-activities");
            fillMacroActivityFields(macroActivityDiv, phase.macroActivity, phase._id, "phase");

            //fill the activities of each phase
            phase.activities.forEach(activity => {
                addActivity(phaseElement.querySelector(".btn-warning"), "phase");
                const activityDiv = phaseElement.querySelector(".activities").lastElementChild;

                fillActivityFields(activityDiv, activity, projectActors, phase._id, "phase");         
            });

            //fill the subphases of each phase
            phase.subphases.forEach(subphase => {
                addSubPhase(phaseElement.querySelector(".btn-info"));
                const subphaseDiv = phaseElement.querySelector(".subphases").lastElementChild;

                // Adds the subphase ID directly to the div
                subphaseDiv.setAttribute("data-subphase-id", subphase._id);
                //Adds the parent phase ID to the subphase div
                subphaseDiv.setAttribute("data-parent-phase-id", phase._id);

                subphaseDiv.querySelector(".subphase-name").value = subphase.title;

                // fill the macroactivity of each subphase
                const subMacroActivityDiv = subphaseDiv.querySelector(".subphase-macro-activities");
                fillMacroActivityFields(subMacroActivityDiv, subphase.macroActivity, subphase._id, "subphase");

                subphase.activities.forEach(activity => {
                    addActivity(subphaseDiv.querySelector(".btn-warning"), "subphase");
                    const activityDiv = subphaseDiv.querySelector(".subphase-activities").lastElementChild;

                    fillActivityFields(activityDiv, activity, projectActors, subphase._id, "subphase");
                });
            }
            );

        });

        // change the form title and button text
        document.getElementById("formTitle").textContent = "Edit Project:";
        document.getElementById("createSave").textContent = "Save Project";

        // show the form
        document.getElementById("projectForm").style.display = "block";
        document.getElementById("ToggleFormBtn").textContent = "Editing Project, click here to close";
            
    } catch (error) {
        console.error("Error loading project for edit or checking logged user:", error);
    }
}

//function to correctly format the date for the input
function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; //"YYYY-MM-DD"
}

//function to reset the form
async function resetForm() {
    const owner = document.getElementById("projectOwner").value; //we keep the owner of the project, he is the user logged in
    document.getElementById("projectForm").reset();
    document.getElementById("projectOwner").value = owner;
    // Reset project ID
    document.getElementById("projectForm").removeAttribute("data-project-id");
    
    // Reset phase and subphase and respective activities IDs
    document.querySelectorAll("#phasesContainer .card").forEach(phaseDiv => {
        // Reset phase ID
        phaseDiv.removeAttribute("data-phase-id");

        // Reset activities inside phases

        phaseDiv.querySelectorAll(".activities .border").forEach(activityDiv => {
            activityDiv.removeAttribute("data-activity-id");
            activityDiv.removeAttribute("data-parent-phase-id");
        });

        // Reset subphases and their activities
        phaseDiv.querySelectorAll(".subphases .border").forEach(subPhaseDiv => {
            // Reset subphase ID
            subPhaseDiv.removeAttribute("data-subphase-id");
            subPhaseDiv.removeAttribute("data-parent-phase-id");

            // Reset activities inside subphases
            subPhaseDiv.querySelectorAll(".subphase-activities .border").forEach(activityDiv => {
                activityDiv.removeAttribute("data-activity-id");
                activityDiv.removeAttribute("data-parent-subphase-id");
            });

        });
    });

    // Reset UI elements
    document.getElementById("createSave").textContent = "Create project";
    document.getElementById("formTitle").textContent = "Create a new project:";
    document.getElementById("projectForm").style.display = "none"; 
    document.getElementById("ToggleFormBtn").textContent = "+ Add a Project";
}

//function to toggle the form to add a project
async function toggleProjectForm() {
    let content = document.getElementById("projectForm");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        document.getElementById("ToggleFormBtn").textContent = "Close Form";

         //adding a note for the user
        const projectForm = document.getElementById("projectForm");

        let existingNote = document.getElementById("dependencyWarning");
        if (!existingNote) {
            const warningMessage = document.createElement("p");
            warningMessage.id = "dependencyWarning";
            warningMessage.textContent = "Note: New activities will only be available as dependencies after saving them with the project.";
            warningMessage.style.color = "blue";
            projectForm.parentNode.insertBefore(warningMessage, projectForm);
        }

        //fill the owner with the user logged: 
        try {
            const loggedUser = await getLoggedUser();
            if (loggedUser) {
                document.getElementById("projectOwner").value = loggedUser;
            }
        } catch (error) {
            console.error("Error while getting the logged user:", error);
        }

    } else {
        content.style.display = "none";
        document.getElementById("ToggleFormBtn").textContent = "+ Add a Project";
        
        //clears the phases and subphases form when the form is closed
        document.getElementById("phasesContainer").innerHTML = "<h4>Phases</h4>";
        
        //reset the form
        resetForm();

        // remove the warning message when closing the form
        let warningMessage = document.getElementById("dependencyWarning");
        if (warningMessage) {
            warningMessage.remove();
        }

        //eventually close the list/gantt view and the handle activities form
        document.getElementById("project-view-container").style.display = "none";
        document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close view button
        document.getElementById("activity-container").style.display = "none";
        document.getElementById("closeActivityViewBtn").style.display = "none"; // Hides the close view button
    }
}

// time machine functions
async function getCurrentNow() {
    try {
        const response = await fetch("https://site232453.tw.cs.unibo.it/api/time/state", {
            method: "GET",
            credentials: "include",
        });
        const data = await response.json();
        console.log("Current time:", data.virtualNow);
        return new Date(data.virtualNow);
    } catch (error) {
        console.error("Error fetching current time:", error);
        return new Date();
    }
}

//listeners

//get the logged user
document.addEventListener("DOMContentLoaded", getLoggedUser);

//load projects when the page is loaded
document.addEventListener("DOMContentLoaded", loadProjects);

document.getElementById("projectForm").addEventListener("keydown", async function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // the form will not be submitted if the user presses Enter
    }
});

//button to toggle the form to add a project
document.getElementById("ToggleFormBtn").addEventListener("click", toggleProjectForm);

//function to save a project
document.getElementById("projectForm").addEventListener("submit", saveOrUpdateProject);

//button to close the project view
document.getElementById("closeProjectViewBtn").addEventListener("click", async function () {
    document.getElementById("project-view-container").style.display = "none";
    this.style.display = "none"; // Hides the close view button
});