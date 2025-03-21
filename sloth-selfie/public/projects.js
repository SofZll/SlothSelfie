//TODO: quando clicco salva in edit o elimina progetto si deve chiudere la visualizzazione a lista/gannt e anche il form di handle activities

//TODO: in edit di progetto: owner può raggruppare attività
//TODO: Gli attori coinvolti ricevono una notifica sulla decisione del capoprogetto (trasla o contrae le attività sincronizzate a quella in ritardo).

//TODO: modalità di visualizzazione separate dagli eventi normali ed appropriate allo scopo per eventi di Inizio e fine attività (usare il campo isInProject nel modello event) 

//TODO: aggiungi loading al caricamento di pagina

//TODO: /* Mobile First: Hide the sidebar and show only the Gantt chart */ ->NON VA

//ottimizza condizioni in fetch forse si può fare meglio

//anche projectsView da rivedere

//Aggiusta bottone abbandon, si devono disattivare gli input e gli output sia per bottone sia con fetch, se riaggiungo membri si riattiva input e bottoni vari

//in fill form di edit le attività a volte non sono nell'ordine giusto, e a volte ci mette un po' a salvare la struttura

//TODO, TIME MACHINE DATE, in projectsHandleActivities utilizzo per due volte let today = new Date(); METTERE QUELLA DI TIMEMACHINE

//(es di link ad un file online, es: https://example.com/files/note.txt) V

// Function to get the logged user
async function getLoggedUser() {
    try {
        const response = await fetch("http://localhost:8000/api/user/profile", {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();

        if (data.success && data.user) {
            console.log("Logged user:", data.user.username);
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
    try {
        const response = await fetch(`http://localhost:8000/api/projects`);
        
        if (!response.ok) {
            throw new Error('Error fetching projects');
        }

        const projects = await response.json();

        //we get the logged user and load only the projects where he is the owner or a member
        const userLogged = await getLoggedUser();
        if (!userLogged) {
            alert("No user is logged in!");
            return;
        }

        // Filter the projects where the logged user is the owner or a member
        const userProjects = projects.filter(project => project.owner.username === userLogged || project.members.some(m => m.username === userLogged));
        
        const list = document.getElementById("projects-list");
        list.innerHTML = ""; // clear the list before loading the projects

        userProjects.forEach(project => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `
                <strong>${project.title}</strong> - Owner: ${project.owner.username} - Members: ${project.members.map(m => m.username).join(", ")}<br>
                 ${
                    project.owner.username === userLogged // Only the owner can edit or delete the project
                    ? `<button class="btn btn-danger btn-sm ml-2" onclick="deleteProject('${project._id}')">Delete Project</button>
                       <button class="btn btn-info btn-sm ml-2" onclick="editProject('${project._id}')">Edit Project</button>` 
                    : ''
                }
                <button class="btn btn-warning btn-sm ml-2" onclick="handleActivities('${project._id}')">Handle Activities</button>
                <button class="btn btn-outline-primary btn-sm view-list" onclick="viewAsList('${project._id}')">View as List</button>
                <button class="btn btn-outline-secondary btn-sm view-gantt" onclick="viewAsGantt('${project._id}')">View as Gantt</button>
            `;
            list.appendChild(li);
        });

        console.log("Projects loaded successfully:", projects);
    } catch (error) {
        console.error("Error while loading projects:", error);
    }
}

//Function to extract activity data from the form, used in saveOrUpdateProject
function extractActivityData(activityDiv) {
    const activityId = activityDiv.getAttribute("data-activity-id");

    // Get the members of the activity
    const membersSelect = activityDiv.querySelector(".activity-actors");
    const members = Array.from(membersSelect.selectedOptions).map(option => option.value);

    // Get the dependencies of the activity
    const dependenciesSelect = activityDiv.querySelector(".activity-dependencies");
    const dependencies = Array.from(dependenciesSelect.selectedOptions).map(option => option.value);

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
            activities: [],
            subphases: []
        };

        phaseDiv.querySelectorAll(".activities > .border").forEach(activityDiv => {
            phase.activities.push(extractActivityData(activityDiv)); 
        });

        phaseDiv.querySelectorAll(".subphases > .border").forEach(subPhaseDiv => {
            // Get the subphase id if we are editing a project
            const subPhaseId = subPhaseDiv.getAttribute("data-subphase-id");
            const subphase = {
                _id: subPhaseId ? subPhaseId : undefined,
                title: subPhaseDiv.querySelector(".subphase-name").value,
                activities: []
            };

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
            response = await fetch(`http://localhost:8000/api/project/${projectId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify(project),
            });
        } else {
            // Save the new project, POST
            response = await fetch(`http://localhost:8000/api/project`, {
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
            alert(projectId ? "Project updated successfully!" : "Project saved successfully!");
            resetForm();
            await loadProjects();
        } else {
            console.error("Error saving/updating project:", data.message);
        }

    } catch (error) {
        console.error("Error saving/updating project:", error);
    }

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

//functions to add phases, subphases and activities to the project form for the frontend

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
        <button type="button" class="btn btn-warning mt-2" onclick="addActivity(this, 'phase')">Add activity</button>
        <div class="activities mt-2"></div> <!-- container activities of the phase -->
        <button type="button" class="btn btn-info mt-2" onclick="addSubPhase(this)">Add subphase</button>
        <div class="subphases mt-2"></div> <!-- Container subphases -->
        <button type="button" class="btn btn-danger mt-2" onclick="removeElement(this)">Remove Fase</button>
    `;
    document.getElementById("phasesContainer").appendChild(phaseDiv);

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
        <button type="button" class="btn btn-warning mt-2" onclick="addActivity(this, 'subphase')">Add activity</button>
        <div class="subphase-activities mt-2"></div> <!-- Container activities of the subphase -->
        <button type="button" class="btn btn-danger mt-2" onclick="removeElement(this)">Remove Subphase</button>
    `;
    subPhaseContainer.appendChild(subPhaseDiv);
}

// Adds an activity to a phase or a subphase
function addActivity(button, type) {
    let activityContainer;

    if (type === "phase") {
        // finds the container of the activities of the phase
        activityContainer = button.parentElement.querySelector(".activities");
    } else {
        // finds the container of the activities of the subphase
        activityContainer = button.parentElement.querySelector(".subphase-activities");
    }

    // Gets all project actors to fill the members field
    let projectActorsInput = document.querySelector("#projectActors").value.trim();
    let projectActors = projectActorsInput ? projectActorsInput.split(",").map(actor => actor.trim()) : [];

    // Creates the options for the select element with the members of the activity
    let membersOptions = projectActors.map(actor => 
        `<option value="${actor}">${actor}</option>`
    ).join("");

    // Gets all project activities for selecting dependencies, we only show the ones that are already saved with an id from the backend
    const allActivities = Array.from(document.querySelectorAll(".border[data-activity-id]")) 
        .filter(activityDiv => activityDiv.getAttribute("data-activity-id"));

    let dependencyOptions = allActivities.map(activity => {
        let activityId = activity.getAttribute("data-activity-id");
        let activityName = activity.querySelector(".activity-name").value;
        return `<option value="${activityId}">${activityName}</option>`;
    }).join("");

    const activityDiv = document.createElement("div");
    activityDiv.classList.add("border", "p-2", "mt-2");
    activityDiv.innerHTML = `
        <label>Activity name:</label>
        <input type="text" class="form-control activity-name" required>
        <label>Activity description (optional):</label>
        <textarea class="form-control activity-description"></textarea>
        <label>Members:</label>
        <select class="form-control activity-actors" multiple>
            ${membersOptions}
        </select>
        <label>Start date:</label>
        <input type="date" class="form-control activity-start" required>
        <label>Deadline:</label>
        <input type="date" class="form-control activity-end" required>
        <label>Is a milestone:</label>
        <input type="checkbox" class="activity-milestone">
        </br>
        <label>Dependencies:</label>
        <select class="form-control activity-dependencies" multiple>
            ${dependencyOptions}
        </select>

        </br>
        <button type="button" class="btn btn-danger mt-2" onclick="closeActivityForm(this)">Remove Activity</button>
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

            console.log("Removing subphase with id:", subphaseId, "from phase:", phaseId);

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
        const response = await fetch(`http://localhost:8000/api/project/${projectId}/remove-phase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error removing phase: ${data.message}`);
        } 
        console.log('Phase removed successfully');
        
    } catch (error) {
        console.error('Errore:', error);
    }
}

// function to remove a subphase from the backend
async function removeSubphaseFromBackend(projectId, phaseId, subphaseId) {
    try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}/remove-subphase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId, subphaseId })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Subphase deleted with success!');
        } else {
            alert('EError while deleting subphase');
        }
    } catch (error) {
        console.error('Errore:', error);
    }
}

//function to remove an activity from the backend
async function removeActivityFromBackend(projectId, phaseId, subphaseId, activityId) {
    try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}/remove-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId, subphaseId, activityId })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Activity deleted with success!');
        } else {
            alert('Error while deleting the activity');
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
            const response = await fetch(`http://localhost:8000/api/project/${projectId}`, {
                method: "DELETE",
                credentials: 'include',
            });

            if (response.ok) {
                alert("Project deleted successfully!");
                // Close the project view if the project is deleted
                document.getElementById("project-view-container").style.display = "none";
                document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close button
                
                await loadProjects(); // Reload the projects list after deletion
            } else {
                alert("Error while deleting the project.");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    }
}

//Function to fill the activities of a project while editing it
function fillActivityFields(activityDiv, activity, projectActors, parentId, parentType) {
    //Adds the activity ID directly to the div
    activityDiv.setAttribute("data-activity-id", activity._id);
    //we also add the parent phase ID to the activity div
    activityDiv.setAttribute(`data-parent-${parentType}-id`, parentId);

    activityDiv.querySelector(".activity-name").value = activity.title;
    activityDiv.querySelector(".activity-description").value = activity.description.content;

    //Fill the select element with the members of the project
    let membersSelect = document.createElement("select");
    membersSelect.classList.add("form-control", "activity-actors");
    membersSelect.multiple = true;

    projectActors.forEach(actor => {
        let option = document.createElement("option");
        option.value = actor;
        option.textContent = actor;
        if (activity.sharedWith.some(a => a.username === actor)) {
            option.selected = true;
        }
        membersSelect.appendChild(option);
    });

    let oldInput = activityDiv.querySelector(".activity-actors");
    oldInput.replaceWith(membersSelect);

    activityDiv.querySelector(".activity-start").value = formatDateForInput(activity.startDate);
    activityDiv.querySelector(".activity-end").value = formatDateForInput(activity.deadline);
    activityDiv.querySelector(".activity-milestone").checked = activity.milestone;

    // We need to select the saved dependencies in the select element
    let dependenciesSelect = activityDiv.querySelector(".activity-dependencies");
    let savedDependencies = activity.dependencies;

    let savedDependencyIds = savedDependencies.map(dep => dep._id);

    Array.from(dependenciesSelect.options).forEach(option => {
        if (savedDependencyIds.includes(option.value)) {
            option.selected = true;
        }
    });
}

//function to fill the form and edit a project
async function editProject(projectId) {
    try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const project = await response.json();

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
    this.style.display = "none"; // Hides the close button
});

 // button to go back to home (React)
 document.getElementById("backToHome").addEventListener("click", async function () {
    window.location.href = "/";
});