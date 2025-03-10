// Function to handle activities status by the members of each activity or by the owner
async function handleActivities(projectId) {
    try {
        // Get the logged user
        const userLogged = await getLoggedUser();
        
        if (!userLogged) {
            alert("No user is logged in!");
            return;
        }
        
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const project = await response.json();

        // Check if the logged user is the owner or a member
        const isOwner = project.owner.username === userLogged;
        const isMember = project.members.some(member => member.username === userLogged);
        if (!isOwner && !isMember) {
            alert("You can't handle the activities of this project, you are not the owner nor a member.");
            return;
        }

        // Get activities: all if owner, only assigned if member
        let activities = project.phases.flatMap(phase => phase.activities);
        activities = activities.concat(project.phases.flatMap(phase => phase.subphases.flatMap(subphase => subphase.activities)));

        if (!isOwner) {
            activities = activities.filter(activity => activity.sharedWith.some(user => user.username === userLogged));
        }

        console.log("Activities to handle:", activities);

        // Show the activities
        let activityContainer = document.getElementById("activity-container");
        let closeBtn = document.getElementById("closeActivityViewBtn");

        let content = `<h2>Project Activities</h2>`;
        if (activities.length === 0) {
            content += `<p>No activities assigned to you.</p>`;
        } else {
            content += `<ul class="list-group">`;
            activities.forEach(activity => {
                let star = activity.milestone ? "*" : "";
                let inputDisabled = activity.input ? 'disabled' : '';  // Check if input already exists
                let insertDisabled = activity.input ? 'disabled' : ''; // Disable the button if input exists

                content += `
                    <li class="list-group-item">
                        <strong>${star}${activity.title}</strong> - Status: ${activity.status}
                        <br>
                        Input type: 
                        <select id="input-type-${activity._id}" onchange="updateInputOutputType('${activity._id}', 'input')">
                            <option value="text">Text</option>
                            <option value="empty">Empty</option>
                            <option value="link">Link</option>
                        </select>
                        <input type="text" id="input-${activity._id}" value="${activity.input || ''}" ${inputDisabled}>  <!-- //getValue(activity._id, activity.input) -->
                        <button class="btn btn-outline-primary btn-sm" id="insert-input-${activity._id}" onclick="insertActivityInputOutput('${activity._id}', 'input')" ${insertDisabled}>Insert Input</button>
                        
                        <label>Output type:</label>
                        <select id="output-type-${activity._id}" onchange="updateInputOutputType('${activity._id}', 'output')">
                            <option value="text">Text</option>
                            <option value="link">Link</option>
                            <option value="true">Completed</option>
                        </select>
                        <input type="text" id="field-output-${activity._id}" value="${activity.output || ''}" disabled>
                        <button class="btn btn-outline-primary btn-sm" id="insert-output-${activity._id}" onclick="insertActivityInputOutput('${activity._id}', 'output')">Insert Output</button>
                        `;
                    // shows the buttons for accept/reject output only if the user is the owner
                    if (isOwner) {
                        content += `
                            <button class="btn btn-outline-danger btn-sm" onclick="rejectOutput('${activity._id}')">Reject output</button>
                            <button class="btn btn-outline-success btn-sm" onclick="acceptOutput('${activity._id}')">Accept output</button>
                        `;
                    }
                    content += `
                        <p>Activity Status: ${activity.status}<p>
                        <p>Deadline: ${new Date(activity.deadline).toLocaleDateString()}<p>
                        <button class="btn btn-success btn-sm" onclick="updateActivityStatus('${activity._id}', 'started')">Start</button>
                        <button class="btn btn-primary btn-sm" onclick="updateActivityStatus('${activity._id}', 'completed')">Complete</button>
                        <button class="btn btn-danger btn-sm" onclick="updateActivityStatus('${activity._id}', 'abandoned')">Abandon</button>
                    </li>
                `;
            });
            content += `</ul>`;
        }

        // Insert the content in the activity container
        activityContainer.innerHTML = content;
        activityContainer.style.display = "block";
        closeBtn.style.display = "block";

    } catch (error) {
        console.error("Error handling activities of the project:", error);
    }
}

// Function to update the input/output type of an activity
function updateInputOutputType(activityId, fieldType) {

    if (fieldType === "input") {
        let inputType = document.getElementById(`input-type-${activityId}`).value;
        let inputField = document.getElementById(`input-${activityId}`);

        if (inputType === "empty") {
            inputField.value = "";
            inputField.disabled = true;
        } else {
            inputField.disabled = false;
        }

    } else if (fieldType === "output") {
        let outputType = document.getElementById(`output-type-${activityId}`).value;
        let outputField = document.getElementById(`field-output-${activityId}`);

        if (outputType === "true") {
            outputField.value = "Completed";
            outputField.disabled = true;
        } else {
            outputField.disabled = false;
            outputField.value = "";
        }
    }
}

// Function to validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Function to insert an input/output for an activity and create a note
async function insertActivityInputOutput(activityId, fieldType) {
    if (fieldType === "input") {
    
        let inputType = document.getElementById(`input-type-${activityId}`).value;
        let inputValue = document.getElementById(`input-${activityId}`).value.trim();

        if (inputType === "link" && !isValidURL(inputValue)) {
            alert("Invalid link. Please enter a valid URL.");
            return;
        }

        let noteContent = "";
        if (inputType === "text" || inputType === "link") {
            noteContent = inputValue;
        }

        let userLogged = await getLoggedUser();

        try {
            const response = await fetch("http://localhost:8000/api/activity/input", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activityId: activityId,
                    content: noteContent,
                    userName: userLogged,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to save activity input.");
            }

            // Disable the Insert Input button after successful submission
            const insertButton = document.querySelector(`#insert-input-${activityId}`);
            if (insertButton) {
                insertButton.disabled = true;
                insertButton.classList.add('disabled');
            }

            alert("Activity input saved successfully!");
        } catch (error) {
            console.error("Error saving activity input:", error);
        }
    } else if (fieldType === "output") {
        let outputType = document.getElementById(`output-type-${activityId}`).value;
        let outputValue = document.getElementById(`field-output-${activityId}`).value.trim();

        if (outputType === "link" && !isValidURL(outputValue)) {
            alert("Invalid link. Please enter a valid URL.");
            return;
        }
         noteContent = outputValue;
        let userLogged = await getLoggedUser();

        try {
            const response = await fetch("http://localhost:8000/api/activity/output", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activityId: activityId,
                    content: noteContent,
                    userName: userLogged,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to save activity output.");
            }

            // Disable the Insert Output button after successful submission
            const insertButton = document.querySelector(`#insert-output-${activityId}`);
            if (insertButton) {
                insertButton.disabled = true;
                insertButton.classList.add('disabled');
            }

            alert("Activity output saved successfully!");
        } catch (error) {
            console.error("Error saving activity output:", error);
        }
    }
}

//TODO
// Function to get the value of the input field (searching for the input note and returning the content)
async function getValue(activityId, activityInput) {
    console.log("activityId:", activityId);
    console.log("activityInput:", activityInput);

    //const inputField = document.getElementById(`input-${activityId}`);

    //console.log("Input field:", inputField);

    //if (!inputField) {
    //    console.error("Input field not found.");
    //    return;
    //}

    try {
        const response = await fetch(`http://localhost:8000/api/note/${activityInput}`);

        if (response.ok) {
            const note = await response.json();
            let value = note.content;
            return value; // we can return the value of the input field
        }
    } catch (error) {
        console.error("Error getting input value:", error);
    }
}

// Function to update activity status //TODO
async function updateActivityStatus(activityId, status) {
    try {
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert("Activity status updated!");
            handleActivities(projectId); // Refresh activities
        } else {
            alert("Error updating activity status.");
        }
    } catch (error) {
        console.error("Error updating activity:", error);
    }
}

// listener for the close button of handle activities
document.getElementById("closeActivityViewBtn").addEventListener("click", function () {
    document.getElementById("activity-container").style.display = "none";
    document.getElementById("closeActivityViewBtn").style.display = "none";
});