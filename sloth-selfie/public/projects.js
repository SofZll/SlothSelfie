//function to load projects from the server
function loadProjects() {
    fetch("/api/projects")
        .then(response => response.json())
        .then(projects => {
            const list = document.getElementById("projects-list");
            list.innerHTML = ""; // clear the list before loading the projects

            projects.forEach(project => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.innerHTML = `<strong>${project.title}</strong> - Owner: ${project.owner}`;
                list.appendChild(li);
            });
        })
        .catch(error => console.error("Errore nel caricamento progetti:", error));
}


let phaseCounter = 0;

// Add a new phase to the project
function addPhase() {
    const phases = document.querySelectorAll("#phasesContainer .card");
    const phaseNumber = phases.length + 1;  //sets the number of the phase considering the other phases in the form
    const phaseDiv = document.createElement("div");
    phaseDiv.classList.add("card", "p-3", "mt-3");
    phaseDiv.innerHTML = `
        <h5>Fase ${phaseNumber}</h5>
        <label>Fase name:</label>
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
        <select class="form-select task-type">
            <option value="sequential">Sequential</option>
            <option value="parallel">Parallel</option>
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


// Save the project
function saveProject(event) {
    event.preventDefault();

    const project = {
        name: document.getElementById("projectName").value,
        description: document.getElementById("projectDesc").value,
        actors: document.getElementById("projectActors").value.split(",").map(a => a.trim()),
        phases: []
    };

    document.querySelectorAll("#phasesContainer > .card").forEach(phaseDiv => {
        const phase = {
            name: phaseDiv.querySelector(".phase-name").value,
            tasks: [],
            subphases: []
        };

        phaseDiv.querySelectorAll(".tasks > .border").forEach(taskDiv => {
            phase.tasks.push({
                name: taskDiv.querySelector(".task-name").value,
                actors: taskDiv.querySelector(".task-actors").value.split(",").map(a => a.trim()),
                type: taskDiv.querySelector(".task-type").value,
                startDate: taskDiv.querySelector(".task-start").value,
                endDate: taskDiv.querySelector(".task-end").value
            });
        });

        phaseDiv.querySelectorAll(".subphases > .border").forEach(subPhaseDiv => {
            const subphase = {
                name: subPhaseDiv.querySelector(".subphase-name").value,
                tasks: []
            };

            subPhaseDiv.querySelectorAll(".tasks > .border").forEach(taskDiv => {
                subphase.tasks.push({
                    name: taskDiv.querySelector(".task-name").value,
                    actors: taskDiv.querySelector(".task-actors").value.split(",").map(a => a.trim()),
                    type: taskDiv.querySelector(".task-type").value,
                    startDate: taskDiv.querySelector(".task-start").value,
                    endDate: taskDiv.querySelector(".task-end").value
                });
            });

            phase.subphases.push(subphase);
        });

        project.phases.push(phase);
    });

    localStorage.setItem("project", JSON.stringify(project));
    alert("Progetto salvato con successo!");
    document.getElementById("projectForm").reset();
}

//load projects when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    loadProjects();
});

//function to save a project
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("projectForm").addEventListener("submit", saveProject);
});

 // button to go back to home (React)
 document.getElementById("backToHome").addEventListener("click", function () {
    window.location.href = "/";
});