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
                li.innerHTML = `<strong>${project.title}</strong> - Owner: ${project.owner}`;
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

        phaseDiv.querySelectorAll(".activity > .border").forEach(activityDiv => {
            phase.activity.push({
                name: activityDiv.querySelector(".activity-name").value,
                members: activityDiv.querySelector(".activity-actors").value.split(",").map(a => a.trim()),
                type: activityDiv.querySelector(".activity-type").value,
                startDate: activityDiv.querySelector(".activity-start").value,
                endDate: activityDiv.querySelector(".activity-end").value
            });
        });

        phaseDiv.querySelectorAll(".subphases > .border").forEach(subPhaseDiv => {
            const subphase = {
                name: subPhaseDiv.querySelector(".subphase-name").value,
                activities: []
            };

            subPhaseDiv.querySelectorAll(".activity > .border").forEach(activityDiv => {
                subphase.activities.push({
                    name: activityDiv.querySelector(".activity-name").value,
                    members: activityDiv.querySelector(".activity-actors").value.split(",").map(a => a.trim()),
                    type: activityDiv.querySelector(".activity-type").value,
                    startDate: activityDiv.querySelector(".activity-start").value,
                    endDate: activityDiv.querySelector(".activity-end").value
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
        loadProjects(); // Ricarica la lista dei progetti
    })
    .catch(error => console.error("Error saving project:", error));

    document.getElementById("projectForm").reset();
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

 // button to go back to home (React)
 document.getElementById("backToHome").addEventListener("click", function () {
    window.location.href = "/";
});