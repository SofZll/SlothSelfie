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
        //description of the activity
        const description = activity.description.content;
        //if the activity is a milestone, we add a star to the title
        const title = activity.milestone ? `*${activity.title}` : activity.title;
        activityItem.innerHTML = `<strong>${title}</strong> - ${description} - Start date: ${startDate} - Deadline: ${deadline} - Members: ${sharedWithUsernames} - Dependencies: ${activity.dependencies.map(dep => dep.title).join(", ")}`;
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

    // Legend for milestones
    const milestoneLegend = document.createElement("p");
    milestoneLegend.innerHTML = "<strong>- Legend:</strong> <i>Milestones are marked with an asterisk (*)<i>";
    projectViewContainer.appendChild(milestoneLegend);

    // Owner of the project
    const projectOwner = document.createElement("h4");
    projectOwner.innerHTML = `Owner: ${project.owner.username}`;
    projectViewContainer.appendChild(projectOwner);

    // Description of the project
    const projectDescription = document.createElement("h4");
    projectDescription.innerHTML = `Description: ${project.description.content}`;
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

// Function to view the project as a Gantt chart with a hierarchy sidebar
async function viewAsGantt(projectId) {
    try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const project = await response.json();

        const projectViewContainer = renderProjectHeader(project);

        // Create a container for both the sidebar and the Gantt chart
        const container = document.createElement("div");
        container.style.display = "flex"; // Sidebar + Gantt side by side
        projectViewContainer.appendChild(container);

        // Create sidebar for hierarchy
        const sidebar = document.createElement("div");
        sidebar.id = "gantt-sidebar";
        container.appendChild(sidebar);

        // Container for the Gantt chart
        const ganttContainer = document.createElement("div");
        ganttContainer.id = "gantt-container";
        container.appendChild(ganttContainer);

        // Generate Gantt tasks
        const tasks = [];
        project.phases.forEach(phase => {
            phase.activities.forEach(activity => {
                tasks.push({
                    id: activity._id,
                    name: activity.title,
                    start: new Date(activity.startDate),
                    end: new Date(activity.deadline),
                    assignee: activity.sharedWith.map(a => a.username).join(", "),
                    dependencies: activity.dependencies || []
                });
            });

            phase.subphases.forEach(subphase => {
                subphase.activities.forEach(activity => {
                    tasks.push({
                        id: activity._id,
                        name: activity.title,
                        start: new Date(activity.startDate),
                        end: new Date(activity.deadline),
                        assignee: activity.sharedWith.map(a => a.username).join(", "),
                        dependencies: activity.dependencies || []
                    });
                });
            });
        });

        document.getElementById("gantt-container").innerHTML = ""; // Reset Gantt
        // Creates the Gantt chart
        const gantt = new Gantt("#gantt-container", tasks, {
            view_mode: "Month",  //"Week"
            on_click: (task) => console.log(task),
            on_date_change: (task, start, end) => console.log(task, start, end),
            on_progress_change: (task, progress) => console.log(task, progress),
            on_delete: (task) => console.log(task),
        });

        gantt.render();
        createHierarchy(sidebar, project);

    } catch (error) {
        console.error("Error while fetching project:", error);
    }
}

// Highlight task in Gantt when clicked from sidebar
function highlightTask(taskId) {
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.style.stroke = "yellow"; // Highlight
        setTimeout(() => taskElement.style.stroke = "", 1500);
    }
}

// Function to generate the hierarchy in a table format in the sidebar
function createHierarchy(sidebar, project) {
    sidebar.innerHTML = ""; // Clear previous content

    // Create a table for the hierarchy
    const table = document.createElement("table");
    table.id = "gantt-sidebar-table";

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Phase/Subphase</th>
            <th>Activity</th>
            <th>Actor/s</th>
            <th>Start</th>
            <th>Deadline</th>
            <th>Days</th>
        </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");

    project.phases.forEach(phase => {
        // Create row for the phase
        const phaseRow = document.createElement("tr");
        const phaseCell = document.createElement("td");
        phaseCell.textContent = phase.title;
        phaseCell.classList.add("phase-cell");
        phaseCell.setAttribute("colspan", 1); // Make phase row span both columns
        phaseRow.appendChild(phaseCell);
        tbody.appendChild(phaseRow);

        // Create rows for each activity in the phase
        phase.activities.forEach(activity => {
            addActivityRow(tbody, activity);
        });

        // Create rows for each subphase and its activities
        phase.subphases.forEach(subphase => {
            const subphaseRow = document.createElement("tr");
            const subphaseCell = document.createElement("td");
            subphaseCell.textContent = `> ${subphase.title}`;
            subphaseCell.classList.add("subphase-cell");
            subphaseCell.setAttribute("colspan", 1); // Make subphase row span both columns
            subphaseRow.appendChild(subphaseCell);
            tbody.appendChild(subphaseRow);

            subphase.activities.forEach(activity => {
                addActivityRow(tbody, activity);
            });
        });
    });

    table.appendChild(tbody);
    sidebar.appendChild(table);
}

function addActivityRow(tbody, activity) {
    const row = document.createElement("tr");
            const phaseCell = document.createElement("td");
            phaseCell.textContent = "";
            phaseCell.classList.add("activity-phase-cell");
            row.appendChild(phaseCell);

            const activityCell = document.createElement("td");
            //if it is a milestone we add a star to the title
            activityCell.textContent = activity.milestone ? `*${activity.title}` : activity.title;
            activityCell.classList.add("activity-title-cell");
            activityCell.onclick = () => highlightTask(activity._id);
            row.appendChild(activityCell);

            const actorCell = document.createElement("td");
            actorCell.textContent = activity.sharedWith.map(a => a.username).join(", ");
            row.appendChild(actorCell);

            const startDateCell = document.createElement("td");
            startDateCell.textContent = new Date(activity.startDate).toLocaleDateString();
            row.appendChild(startDateCell);

            const deadlineCell = document.createElement("td");
            deadlineCell.textContent = new Date(activity.deadline).toLocaleDateString();
            row.appendChild(deadlineCell);

            const daysCell = document.createElement("td");
            const diffTime = Math.abs(new Date(activity.deadline) - new Date(activity.startDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Calculate number of days
            daysCell.textContent = diffDays;
            row.appendChild(daysCell);

            tbody.appendChild(row);
}
