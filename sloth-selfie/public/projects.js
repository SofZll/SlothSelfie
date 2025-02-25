//TODO: GLI USERNAME ELENCATI IN SHAREDWITH DEVONO ESSERE TRA I MEMBERS DEL PROGETTO, aggiungi controlli relativi
//TODO: Aggiungi la modalità di visualizzazione gannt
//TODO: start di progetto
//TODO: fare parte back e front per il salvataggio di edit (saveEdtProject)
//TODO: VISUALIZZA PROGETTI SE SEI OWNER O SEI MEMBRO, aggiungi controlli relativi
//TODO: controlla le date, deve essere range fine >= inizio
//TODO: da riguardare saveEditProject per eliminazione di fasi, sottofasi e attività ->
//mi cancella l'attività della sottofase come fosse la sottofase, e la sottofase non la cancella...su db, lato front sembra ok
//la sottofase della fase non la cancella! e l'attività della sottofase la cancella come fosse la sottofase
//la fase la cancella, e la attività della fase la cancella

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
        
        const list = document.getElementById("projects-list");
        list.innerHTML = ""; // clear the list before loading the projects

        projects.forEach(project => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `
                <strong>${project.title}</strong> - Owner: ${project.owner.username} - Description: ${project.description} - Members: ${project.members.map(m => m.username).join(", ")}<br>
                <button class="btn btn-danger btn-sm ml-2" onclick="deleteProject('${project._id}')">Delete Project</button>
                <button class="btn btn-info btn-sm ml-2" onclick="editProject('${project._id}')">Edit Project</button>
                <button class="btn btn-success btn-sm ml-2" onclick="startProject('${project._id}')">Start Project</button>
                <button class="btn btn-outline-primary btn-sm view-list" onclick="viewAsList('${project._id}')">View as List</button>
                <button class="btn btn-outline-secondary btn-sm view-gantt" onclick="viewAsGannt('${project._id}')">View as Gantt</button>
            `;
            list.appendChild(li);
        });

        console.log("Projects loaded successfully:", projects);
    } catch (error) {
        console.error("Error while loading projects:", error);
    }
}

//Function to save a new or edited project
async function saveOrUpdateProject(event) {
    event.preventDefault();
     // Get the project id if we are editing a project
    const projectId = document.getElementById("editingProjectId").value;
    console.log("Project id:", projectId);
    const project = {
        title: document.getElementById("projectName").value,
        owner: document.getElementById("projectOwner").value,
        description: document.getElementById("projectDesc").value,
        members: document.getElementById("projectActors").value.split(",").map(a => a.trim()),
        phases: []
    };

    document.querySelectorAll("#phasesContainer > .card").forEach(phaseDiv => {
        // Get the phase id if we are editing a project
        const phaseId = phaseDiv.querySelector("#editingPhaseId").value;
        const phase = {
            _id: phaseId ? phaseId : undefined,
            name: phaseDiv.querySelector(".phase-name").value,
            activities: [],
            subphases: []
        };

        phaseDiv.querySelectorAll(".activities > .border").forEach(activityDiv => {
            const activityId = activityDiv.querySelector("#editingActivityId").value;
            phase.activities.push({
                _id: activityId ? activityId : undefined,
                title: activityDiv.querySelector(".activity-name").value,
                sharedWith: activityDiv.querySelector(".activity-actors").value.split(",").map(a => a.trim()),
                startDate: activityDiv.querySelector(".activity-start").value,
                deadline: activityDiv.querySelector(".activity-end").value
            });
        });

        phaseDiv.querySelectorAll(".subphases > .border").forEach(subPhaseDiv => {
            // Get the subphase id if we are editing a project
            const subPhaseId = subPhaseDiv.querySelector("#editingSubphaseId").value;
            const subphase = {
                _id: subPhaseId ? subPhaseId : undefined,
                name: subPhaseDiv.querySelector(".subphase-name").value,
                activities: []
            };

            subPhaseDiv.querySelectorAll(".subphase-activities > .border").forEach(activityDiv => {
                const activityId = activityDiv.querySelector("#editingActivityId").value;
                subphase.activities.push({
                    _id: activityId ? activityId : undefined,
                    title: activityDiv.querySelector(".activity-name").value,
                    sharedWith: activityDiv.querySelector(".activity-actors").value.split(",").map(a => a.trim()),
                    startDate: activityDiv.querySelector(".activity-start").value,
                    deadline: activityDiv.querySelector(".activity-end").value
                });
            });

            phase.subphases.push(subphase);
        });

        project.phases.push(phase);
    });

    console.log("Project to save or update:", project);

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
        console.log("Server response:", data);

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
        <!-- hidden input to store the id of the phase being edited -->
        <input type="hidden" id="editingPhaseId">
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
        <!-- hidden input to store the id of the subphase being edited -->
        <input type="hidden" id="editingSubphaseId">
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

    const activityDiv = document.createElement("div");
    activityDiv.classList.add("border", "p-2", "mt-2");
    activityDiv.innerHTML = `
        <!-- hidden input to store the id of the activity being edited -->
        <input type="hidden" id="editingActivityId">
        <label>Activity name:</label>
        <input type="text" class="form-control activity-name" required>
        <label>Members (comma separated):</label>
        <input type="text" class="form-control activity-actors" required>
        <label>Start date:</label>
        <input type="date" class="form-control activity-start" required>
        <label>Deadline:</label>
        <input type="date" class="form-control activity-end" required>
        <button type="button" class="btn btn-danger mt-2" onclick="closeActivityForm(this)">Remove Activity</button>
    `;
    activityContainer.appendChild(activityDiv);
}

//function to remove a phase or subphase while compiling the add-form
function removeElement(button) {
    const element = button.parentElement;
    
    // if we remove a phase, we update the counter
    if (element.classList.contains("card")) {  
        element.remove();
        updatePhaseNumbers(); // Renumerates the phases left
    } else {
        element.remove();
    }
}

// Function to remove the form of an activity
function closeActivityForm(button) {
    const activityDiv = button.parentElement;
    activityDiv.remove();
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
        console.log("Deleting project with id:", projectId);
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

//function to fill the form and edit a project
async function editProject(projectId) {

    try {
        // Get the logged user
        const userLogged = await getLoggedUser();
        
        if (!userLogged) {
            alert("No user is logged in!");
            return;
        }
        
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const project = await response.json();

        console.log("Project to edit:", project);

        // check if the logged user is the owner of the project
        const owner = project.owner.username;

        if (owner !== userLogged) {
            alert("You can't edit this project, you are not the owner.");
            return; // exit the function if the user is not the owner
        }
        
        // fill the form with the project data
        document.getElementById("editingProjectId").value = projectId;
        document.getElementById("projectName").value = project.title;
        document.getElementById("projectOwner").value = project.owner.username;
        document.getElementById("projectDesc").value = project.description;
        document.getElementById("projectActors").value = project.members.map(m => m.username).join(", ");

        // reset the phases container and reload the phases
        const phasesContainer = document.getElementById("phasesContainer");
        phasesContainer.innerHTML = "<h4>Phases</h4>";
        project.phases.forEach(phase => {
            let phaseElement = addPhase(phase);
            //fill the id of each existing phase
            phaseElement.querySelector("#editingPhaseId").value = phase._id;
            //fill the name of each phase
            phaseElement.querySelector(".phase-name").value = phase.title;
            //fill the activities of each phase
            phase.activities.forEach(activity => {
                addActivity(phaseElement.querySelector(".btn-warning"), "phase");
                const activityDiv = phaseElement.querySelector(".activities").lastElementChild;
                //fill the id of each existing activity
                activityDiv.querySelector("#editingActivityId").value = activity._id;
                activityDiv.querySelector(".activity-name").value = activity.title;
                activityDiv.querySelector(".activity-actors").value = activity.sharedWith.map(a => a.username).join(", ");
                activityDiv.querySelector(".activity-start").value = formatDateForInput(activity.startDate);
                activityDiv.querySelector(".activity-end").value = formatDateForInput(activity.deadline);;
            });

            //fill the subphases of each phase
            phase.subphases.forEach(subphase => {
                addSubPhase(phaseElement.querySelector(".btn-info"));
                const subphaseDiv = phaseElement.querySelector(".subphases").lastElementChild;
                //fill the id of each existing subphase
                subphaseDiv.querySelector("#editingSubphaseId").value = subphase._id;
                subphaseDiv.querySelector(".subphase-name").value = subphase.title;
                subphase.activities.forEach(activity => {
                    addActivity(subphaseDiv.querySelector(".btn-warning"), "subphase");
                    const activityDiv = subphaseDiv.querySelector(".subphase-activities").lastElementChild;
                    //fill the id of each existing activity
                    activityDiv.querySelector("#editingActivityId").value = activity._id;
                    activityDiv.querySelector(".activity-name").value = activity.title;
                    activityDiv.querySelector(".activity-actors").value = activity.sharedWith.map(a => a.username).join(", ");
                    activityDiv.querySelector(".activity-start").value = formatDateForInput(activity.startDate);
                    activityDiv.querySelector(".activity-end").value = formatDateForInput(activity.deadline);;
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

// Function to sort the activities of a phase/subphase based on the selected criteria
function sortActivities(phase_subphase, criteria) {
    const activitiesList = document.getElementById(`activities-${phase_subphase._id}`);
    activitiesList.innerHTML = ""; // clears the list

    // orders the activities based on the selected criteria
    let sortedActivities = phase_subphase.activities;
    if (criteria === "member") {
        //we get the member selected
        const member = document.getElementById("memberSelect").value;
        sortedActivities.sort((a, b) => {
            const aHasMember = a.sharedWith.some(user => user.username === member);
            const bHasMember = b.sharedWith.some(user => user.username === member);
            
            //if 'a' has the member and 'b' doesn't, 'a' comes first
            if (aHasMember && !bHasMember) return -1;
            //if 'b' has the member and 'a' doesn't, 'b' comes first
            if (!aHasMember && bHasMember) return 1;
            // If both have or don't have the member, order by deadline
            return a.deadline.localeCompare(b.deadline);
        });

    } else {
        sortedActivities = sortedActivities.sort((a, b) => {
            return a.deadline.localeCompare(b.deadline);
        });
    }

    // Adds the sorted activities to the list
    sortedActivities.forEach(activity => {
        const activityItem = document.createElement("li");

        // Create a string with the usernames of the members
        const sharedWithUsernames = activity.sharedWith.map(user => user.username).join(", ");
        const startDate = new Date(activity.startDate).toLocaleDateString();
        const deadline = new Date(activity.deadline).toLocaleDateString();
        activityItem.innerHTML = `<strong>${activity.title}</strong> -  -Start date: ${startDate} - Deadline: ${deadline} - Members: ${sharedWithUsernames}`;
        activitiesList.appendChild(activityItem);
    });
}

//function to render the project header in the view
function renderProjectHeader(project) {
    const projectViewContainer = document.getElementById("project-view-container");
    projectViewContainer.innerHTML = ""; // Clear the container
    projectViewContainer.style.display = "block"; // Show the container

    const closeButton = document.getElementById("closeProjectViewBtn");
    closeButton.style.display = "inline-block"; // Show the close button

    // Title of the project
    const projectTitle = document.createElement("h3");
    projectTitle.innerHTML = `Project: ${project.title}`;
    projectViewContainer.appendChild(projectTitle);

    // Owner of the project
    const projectOwner = document.createElement("h4");
    projectOwner.innerHTML = `Owner: ${project.owner.username}`;
    projectViewContainer.appendChild(projectOwner);

    // Description of the project
    const projectDescription = document.createElement("h4");
    projectDescription.innerHTML = `Description: ${project.description}`;
    projectViewContainer.appendChild(projectDescription);

    return projectViewContainer; // Returns the container
}

//Function to render the phases and subphases of the project in the list view
function renderPhase(phase, container, typeSelect) {

    // Create a div for each phase and subphase
    const phaseDiv = document.createElement("div");
    phaseDiv.innerHTML = `<h4>Phase: ${phase.title}</h4>`;
    container.appendChild(phaseDiv);

    // List of activities for each phase (default: date sorting)
    const activitiesListPhase = document.createElement("ul");
    activitiesListPhase.id = `activities-${phase._id}`;
    activitiesListPhase.innerHTML = `<h5>Activities of the Phase:</h5>`;
    phaseDiv.appendChild(activitiesListPhase);

    sortActivities(phase, typeSelect);

    // Container for subphases
    phase.subphases.forEach(subphase => {
        const subphaseDiv = document.createElement("div");
        subphaseDiv.innerHTML = `<h5>Subphase: ${subphase.title}</h5>`;
        phaseDiv.appendChild(subphaseDiv);

        // Container for activities of subphases
        const activitiesList = document.createElement("ul");
        activitiesList.id = `activities-${subphase._id}`;
        activitiesList.innerHTML = `<h5>Activities of the Subphase:</h5>`;
        subphaseDiv.appendChild(activitiesList);

        sortActivities(subphase, typeSelect);
    });
}

//Event listener for the sorting of the activities in the list view
function setupSorting(project) {
    document.getElementById("sortSelect").addEventListener("change", (event) => {
        const selectedCriteria = event.target.value;
        const memberSelect = document.getElementById("memberSelect");

        if (selectedCriteria === "member") {
            memberSelect.style.display = "inline";
            memberSelect.innerHTML = `<option value="">Select a member</option>`;

            const members = project.members.map(m => m.username);
            members.forEach(member => {
                const option = document.createElement("option");
                option.value = member;
                option.textContent = member;
                memberSelect.appendChild(option);
            });

            memberSelect.addEventListener("change", () => {
                project.phases.forEach(phase => {
                    sortActivities(phase, "member");
                    phase.subphases.forEach(subphase => sortActivities(subphase, "member"));
                });
            });
        } else {
            memberSelect.style.display = "none";
        }

        project.phases.forEach(phase => {
            sortActivities(phase, selectedCriteria);
            phase.subphases.forEach(subphase => sortActivities(subphase, selectedCriteria));
        });
    });
}

// Function to view the project as a list
async function viewAsList(projectId) {
    try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const project = await response.json();

        const projectViewContainer = renderProjectHeader(project);

        // Options to sort the activities
        const sortOptions = document.createElement("div");
        sortOptions.innerHTML = `
            <label for="sortSelect">Sort activities by: </label>
            <select id="sortSelect" class="form-select w-auto d-inline">
                <option value="date">Closest deadline (Default)</option>
                <option value="member">Member</option>
            </select>
            <select id="memberSelect" class="form-select w-auto" style="display: none;">
                <option value="">Select a member</option>
            </select>
        `;
        projectViewContainer.appendChild(sortOptions);

        let typeSelect = "date"; // Default sorting

        // Container for phases and subphases
        const listContainer = document.createElement("div");
        projectViewContainer.appendChild(listContainer);

        // Render the phases and subphases
        project.phases.forEach(phase => renderPhase(phase, listContainer, typeSelect));

        // Event listener to sort the activities
        setupSorting(project);

    } catch (error) {
        console.error("Error while fetching project:", error);
    }
}

// Function to view the project as a Gantt chart
async function viewAsGannt(projectId) {
    try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const project = await response.json();

        const projectViewContainer = renderProjectHeader(project);

        // Container for the Gantt chart
        const ganttContainer = document.createElement("div");
        ganttContainer.id = "gantt-container";
        projectViewContainer.appendChild(ganttContainer);

        // Create the Gantt chart
        createGantt(project);
    } catch (error) {
        console.error("Error while fetching project:", error);
    }
}

//function to reset the form
async function resetForm() {
    const owner = document.getElementById("projectOwner").value; //we keep the owner of the project, he is the user logged in
    document.getElementById("projectForm").reset();
    document.getElementById("projectOwner").value = owner;
    // Reset project ID
    document.getElementById("editingProjectId").value = "";
    // Reset phase and subphase and respective activities IDs
    document.querySelectorAll("#phasesContainer .card").forEach(phaseDiv => {
        // Reset phase ID
        phaseDiv.querySelectorAll("[id='editingPhaseId']").forEach(phaseIdInput => {
            if (phaseIdInput) phaseIdInput.value = "";
        });

        // Reset activities inside phases
        phaseDiv.querySelectorAll(".activities .border [id='editingActivityId']").forEach(activityIdInput => {
            if (activityIdInput) activityIdInput.value = "";
        });

        // Reset subphases and their activities
        phaseDiv.querySelectorAll(".subphases .border").forEach(subPhaseDiv => {
            // Reset subphase ID
            subPhaseDiv.querySelectorAll("[id='editingSubphaseId']").forEach(subPhaseIdInput => {
                if (subPhaseIdInput) subPhaseIdInput.value = "";
            });

            // Reset activities inside subphases
            subPhaseDiv.querySelectorAll(".subphase-activities .border [id='editingActivityId']").forEach(activityIdInput => {
                if (activityIdInput) activityIdInput.value = "";
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
        document.getElementById("ToggleFormBtn").textContent = "Close";

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