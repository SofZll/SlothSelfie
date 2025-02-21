//TODO: GLI USERNAME ELENCATI IN SHAREDWITH DEVONO ESSERE TRA I MEMBERS DEL PROGETTO, aggiusta visualizzazione con username
//TODO: COME PASSO LO USER LOGGATO? LUI è L'OWNER DEL PROGETTO
//TODO: Aggiungi la modalità di visualizzazione gannt
//TODO: Edit e start di progetto
//TODO: VISUALIZZA PROGETTI SE SEI OWNER O SEI MEMBRO

//GET, function to load projects from the server
function loadProjects() {
    fetch(`http://localhost:8000/api/projects`)
        .then(response => response.json())
        .then(projects => {
            const list = document.getElementById("projects-list");
            list.innerHTML = ""; // clear the list before loading the projects

            projects.forEach(project => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.innerHTML = `<strong>${project.title}</strong>- Owner: ${project.owner}
                <button class="btn btn-danger btn-sm ml-2" onclick="deleteProject('${project._id}')">Delete Project</button>
                <button class="btn btn-info btn-sm ml-2" onclick="editProject('${project._id}')">Edit Project</button>
                <button class="btn btn-success btn-sm ml-2" onclick="startProject('${project._id}')">Start Project</button>
                <button class="btn btn-outline-primary btn-sm view-list" onclick="viewAsList('${project._id}')">View as List</button>
                <button class="btn btn-outline-secondary btn-sm view-gantt" onclick="viewAsGannt('${project._id}')">View as Gantt</button>
                `;
                list.appendChild(li);
            });

            console.log("Projects loaded successfully:", projects);
        })
        .catch(error => console.error("Error while loading projects:", error));
}


// Save the project
function saveProject(event) {
    event.preventDefault();

    const project = {
        title: document.getElementById("projectName").value,
        owner: document.getElementById("projectOwner").value,
        description: document.getElementById("projectDesc").value,
        members: document.getElementById("projectActors").value.split(",").map(a => a.trim()),
        phases: []
    };

    document.querySelectorAll("#phasesContainer > .card").forEach(phaseDiv => {
        const phase = {
            name: phaseDiv.querySelector(".phase-name").value,
            activities: [],
            subphases: []
        };

        phaseDiv.querySelectorAll(".activities > .border").forEach(activityDiv => {
            console.log("Found activity div:", activityDiv);
            phase.activities.push({
                title: activityDiv.querySelector(".activity-name").value,
                sharedWith: activityDiv.querySelector(".activity-actors").value.split(",").map(a => a.trim()),
                type: activityDiv.querySelector(".activity-type").value,
                startDate: activityDiv.querySelector(".activity-start").value,
                deadline: activityDiv.querySelector(".activity-end").value
            });
        });

        phaseDiv.querySelectorAll(".subphases > .border").forEach(subPhaseDiv => {
            const subphase = {
                name: subPhaseDiv.querySelector(".subphase-name").value,
                activities: []
            };

            subPhaseDiv.querySelectorAll(".subphase-activities > .border").forEach(activityDiv => {
                console.log("Found activity div:", activityDiv);
                subphase.activities.push({
                    title: activityDiv.querySelector(".activity-name").value,
                    sharedWith: activityDiv.querySelector(".activity-actors").value.split(",").map(a => a.trim()),
                    type: activityDiv.querySelector(".activity-type").value,
                    startDate: activityDiv.querySelector(".activity-start").value,
                    deadline: activityDiv.querySelector(".activity-end").value
                });
            });

            phase.subphases.push(subphase);
        });

        project.phases.push(phase);
    });

    console.log("Project to save:", project);

    //POST, we save the project
    fetch(`http://localhost:8000/api/project`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(project),
    })
    .then(response => response.json())
    .then(data => {
        alert("Project saved successfully!");
        document.getElementById("projectForm").reset();
        loadProjects(); // Reload the projects list
    })
    .catch(error => console.error("Error saving project:", error));

    document.getElementById("projectForm").reset();
    document.getElementById("phasesContainer").innerHTML = "";//we remove the phase and subphase empty form after saving
    document.getElementById("projectForm").style.display = "none"; // hides the form after saving
    document.getElementById("ToggleFormBtn").textContent = "+ Add a Project"; //the button text is changed to "Add a Project" after saving
    loadProjects(); // Reload the projects list
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
        <input type="text" class="form-control phase-name">
        <button type="button" class="btn btn-warning mt-2" onclick="addActivity(this, 'phase')">Add activity</button>
        <div class="activities mt-2"></div> <!-- container activities of the phase -->
        <button type="button" class="btn btn-info mt-2" onclick="addSubPhase(this)">Add subphase</button>
        <div class="subphases mt-2"></div> <!-- Container subphases -->
        <button type="button" class="btn btn-danger mt-2" onclick="removeElement(this)">Remove Fase</button>
    `;
    document.getElementById("phasesContainer").appendChild(phaseDiv);
}

// Add a new subphase to the project
function addSubPhase(button) {
    const subPhaseContainer = button.nextElementSibling;
    const subPhaseDiv = document.createElement("div");
    subPhaseDiv.classList.add("border", "p-2", "mt-2");
    subPhaseDiv.innerHTML = `
        <label>Subphase name:</label>
        <input type="text" class="form-control subphase-name">
        <button type="button" class="btn btn-warning mt-2" onclick="addActivity(this, 'subphase')">Add activity</button>
        <div class="subphase-activities mt-2"></div> <!-- Container activities of the subphase -->
        <button type="button" class="btn btn-danger mt-2" onclick="removeElement(this)">Remove subphase</button>
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
        <label>Activity name:</label>
        <input type="text" class="form-control activity-name">
        <label>Members (comma separated):</label>
        <input type="text" class="form-control activity-actors">
        <label>Type:</label>
        <select class="form-select activity-type">
            <option value="Sequential">Sequential</option>
            <option value="Parallel">Parallel</option>
        </select>
        <label>Start date:</label>
        <input type="date" class="form-control activity-start">
        <label>Deadline:</label>
        <input type="date" class="form-control activity-end">
        <button type="button" class="btn btn-danger mt-2" onclick="closeActivityForm(this)">Close</button>
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
function deleteProject(projectId) {
    if (confirm("Are you sure you want to delete this project?")) {
        console.log("Deleting project with id:", projectId);
        // DELETE request to remove the project
        fetch(`http://localhost:8000/api/project/${projectId}`, {
            method: "DELETE",
            credentials: 'include',
        })
        .then(response => {
            if (response.ok) {
                alert("Project deleted successfully!");
                //close the project view if the project is deleted
                document.getElementById("project-view-container").style.display = "none";
                document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close button
                loadProjects(); // Reload the projects list after deletion
            } else {
                alert("Error while deleting the project.");
            }
        })
        .catch(error => console.error("Error deleting project:", error));
    }
}

// Function to view the project as a list
function viewAsList(projectId) {
    fetch(`http://localhost:8000/api/project/${projectId}`)
        .then(response => response.json())
        .then(project => {
            const projectViewContainer = document.getElementById("project-view-container");
            projectViewContainer.innerHTML = ""; // clear the container
            projectViewContainer.style.display = "block"; // show the container
            const closeButton = document.getElementById("closeProjectViewBtn");
            closeButton.style.display = "inline-block"; // show the close button

            //we log the project to see the structure
            console.log("Project to view:", project);

            // Title of the project
            const projectTitle = document.createElement("h3");
            projectTitle.innerHTML = `Project: ${project.title}`;
            projectViewContainer.appendChild(projectTitle);

            // Description of the project
            const projectDescription = document.createElement("h4");
            projectDescription.innerHTML = `Description: ${project.description}`;
            projectViewContainer.appendChild(projectDescription);

            // Options to sort the activities
            const sortOptions = document.createElement("div");
            sortOptions.innerHTML = `
                <label for="sortSelect">Sort activities by: </label>
                <select id="sortSelect" class="form-select w-auto d-inline">
                    <option value="date">Date (Default)</option>
                    <option value="member">Member</option>
                </select>
            `;
            projectViewContainer.appendChild(sortOptions);

            // Container for phases and subphases
            const listContainer = document.createElement("div");
            projectViewContainer.appendChild(listContainer);

            // Create a div for each phase and subphase
            project.phases.forEach(phase => {
                const phaseDiv = document.createElement("div");
                phaseDiv.innerHTML = `<h4>Phase: ${phase.title}</h4>`;
                listContainer.appendChild(phaseDiv);

                //list of activities of each phase (default: date sorting)
                
                const activitiesListphase = document.createElement("ul");
                activitiesListphase.id = `activities-${phase._id}`;
                activitiesListphase.innerHTML = `<h5>Activities of the Phase:</h5>`;
                phaseDiv.appendChild(activitiesListphase);

                sortActivities(phase, "date");
                

                // Container for the subphases
                phase.subphases.forEach(subphase => {
                    const subphaseDiv = document.createElement("div");
                    subphaseDiv.innerHTML = `<h5>Subphase: ${subphase.title}</h5>`;
                    phaseDiv.appendChild(subphaseDiv);

                    // Container for the activities of the subphases
                    const activitiesList = document.createElement("ul");
                    activitiesList.id = `activities-${subphase._id}`;
                    activitiesList.innerHTML = `<h5>Activities of the Subphase:</h5>`;
                    subphaseDiv.appendChild(activitiesList);

                    sortActivities(subphase, "date");
                });
            });

            // Event listener to sort the activities
            document.getElementById("sortSelect").addEventListener("change", (event) => {
                const selectedCriteria = event.target.value;
                project.phases.forEach(phase => {
                    phase.subphases.forEach(subphase => {
                        sortActivities(subphase, selectedCriteria);
                    });
                });
            });
        })
        .catch(error => console.error("Error while fetching project:", error));
}

// Function to sort the activities of a phase/subphase based on the selected criteria //TODO: MEMBER SORTING
function sortActivities(phase_subphase, criteria) {
    const activitiesList = document.getElementById(`activities-${phase_subphase._id}`);
    activitiesList.innerHTML = ""; // clears the list

    // orders the activities based on the selected criteria
    let sortedActivities = phase_subphase.activities;
    if (criteria === "member") {
        sortedActivities = sortedActivities.sort((a, b) => {
            return a.sharedWith[0].localeCompare(b.sharedWith[0]);
        });
    } else {
        sortedActivities = sortedActivities.sort((a, b) => {
            return a.deadline.localeCompare(b.deadline);
        });
    }

    // Adds the sorted activities to the list
    sortedActivities.forEach(activity => {
        const activityItem = document.createElement("li");
        activityItem.innerHTML = `<strong>${activity.title}</strong> - Deadline: ${activity.deadline} - Member: ${activity.sharedWith[0]}`;
        activitiesList.appendChild(activityItem);
    });
}

// Function to view the project as a Gantt chart //TODO
function viewAsGannt(projectId) {
    fetch(`http://localhost:8000/api/project/${projectId}`)
        .then(response => response.json())
        .then(project => {
            const projectViewContainer = document.getElementById("project-view-container");
            projectViewContainer.innerHTML = ""; // clear the container
            projectViewContainer.style.display = "block"; // show the container
            const closeButton = document.getElementById("closeProjectViewBtn");
            closeButton.style.display = "inline-block"; // show the close button

            // Title of the project
            const projectTitle = document.createElement("h3");
            projectTitle.innerHTML = `Project: ${project.title}`;
            projectViewContainer.appendChild(projectTitle);

            // Description of the project
            const projectDescription = document.createElement("h4");
            projectDescription.innerHTML = `Description: ${project.description}`;
            projectViewContainer.appendChild(projectDescription);

            // Container for the Gantt chart
            const ganttContainer = document.createElement("div");
            ganttContainer.id = "gantt-container";
            projectViewContainer.appendChild(ganttContainer);

            // Create the Gantt chart
            createGantt(project);
        })
        .catch(error => console.error("Error while fetching project:", error));
}


//listeners

//load projects when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    loadProjects();
});

//function to save a project
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("projectForm").addEventListener("submit", saveProject);
});

document.getElementById("projectForm").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // the form will not be submitted if the user presses Enter
    }
});


//button to toggle the form to add a project
document.getElementById("ToggleFormBtn").addEventListener("click", function () {
    let content = document.getElementById("projectForm");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        this.textContent = "Close";
    } else {
        content.style.display = "none";
        this.textContent = "+ Add a Project";
    }
});

//button to close the project view
document.getElementById("closeProjectViewBtn").addEventListener("click", function () {
    document.getElementById("project-view-container").style.display = "none";
    this.style.display = "none"; // Nasconde il bottone stesso
});


 // button to go back to home (React)
 document.getElementById("backToHome").addEventListener("click", function () {
    window.location.href = "/";
});