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
                // Check if the activity has a deadline and if it is Overdue or Abandoned
                let today = new Date();
                let deadline = new Date(activity.deadline);

                let isLate = today > deadline && !activity.output; // Overdue without output
                let isAbandoned = today - deadline > 7 * 24 * 60 * 60 * 1000; // Overdue since last 7 days

                console.log("Activity:", activity.title, "isLate:", isLate, "isAbandoned:", isAbandoned);

                if (isLate) {
                    updateActivityStatus(activity._id, "Overdue", projectId);
                }
                if (isAbandoned) {
                    updateActivityStatus(activity._id, "Abandoned", projectId);
                }

                let star = activity.milestone ? "*" : ""; // milestone
                let inputDisabled = activity.input ? 'disabled' : '';  // Check if input already exists
                let inputInsertDisabled = activity.input ? 'disabled' : ''; // Disable the button if input exists
                let outputDisabled = activity.output ? 'disabled' : ''; // Check if output already exists
                let outputInsertDisabled = activity.output ? 'disabled' : ''; // Disable the button if output exists

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
                        <button class="btn btn-outline-primary btn-sm" id="insert-input-${activity._id}" onclick="insertActivityInputOutput('${activity._id}', 'input', '${projectId}')" ${inputInsertDisabled}>Insert Input</button>
                        
                        <label>Output type:</label>
                        <select id="output-type-${activity._id}" onchange="updateInputOutputType('${activity._id}', 'output')">
                            <option value="text">Text</option>
                            <option value="link">Link</option>
                            <option value="true">Completed</option>
                        </select>
                        <input type="text" id="output-${activity._id}" value="${activity.output || ''}" ${outputDisabled}>
                        <button class="btn btn-outline-primary btn-sm" id="insert-output-${activity._id}" onclick="insertActivityInputOutput('${activity._id}', 'output', '${projectId}')" ${outputInsertDisabled}>Insert Output</button>
                        `;
                    // shows the buttons for accept/reject output only if the user is the owner
                    if (isOwner) {
                        content += `
                            <button class="btn btn-outline-danger btn-sm" onclick="updateActivityStatus('${activity._id}', 'Reactivated', '${projectId}')">Reject output</button>
                        `;
                    }
                    content += `
                        <p>Activity Status: ${activity.status}<p>
                        <p>Deadline: ${new Date(activity.deadline).toLocaleDateString()}<p>
                        <button class="btn btn-success btn-sm" onclick="updateActivityStatus('${activity._id}', 'Active', '${projectId}')" ${!activity.input ? 'disabled' : ''}>Start</button>
                        <button class="btn btn-primary btn-sm" onclick="updateActivityStatus('${activity._id}', 'Completed', '${projectId}')" ${!activity.output ? 'disabled' : ''}>Complete</button>
                        <button class="btn btn-danger btn-sm" onclick="abandonActivity('${activity._id}', '${projectId}')">Abandon</button>
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
async function insertActivityInputOutput(activityId, fieldType, projectId) {
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

             // Update activity status to Activatable
            await updateActivityStatus(activityId, "Activatable", projectId);

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

// Function to update activity status
async function updateActivityStatus(activityId, newStatus, projectId) {
    try {
        const response = await fetch(`http://localhost:8000/api/activity/status/${activityId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                activityId: activityId,
                status: newStatus,
            })
        });

        if (response.ok) {
            // Aggiorna il testo dello stato nella UI
            let statusElement = document.getElementById(`status-${activityId}`);
            if (statusElement) {
                statusElement.innerText = `Status: ${newStatus}`;
                //reset the dom
                document.getElementById("activity-container").innerHTML = "";
                await handleActivities(projectId); // Refresh activities
            }
        }
    } catch (error) {
        console.error("Error updating activity:", error);
    }
}

// Function to abandon an activity if no more users are assigned   PROBELMA CON FORMATO USERS DENTRO A SHAREDWITH
async function abandonActivity(activityId, projectId) {
    try {
        const userLogged = await getLoggedUser();

        // Get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        console.log("Activity to abandon:", activity);
        console.log("User logged:", userLogged);
        console.log("Activity shared with:", activity.sharedWith);
        // Remove the logged user from sharedWith
        let updatedSharedWith = activity.sharedWith.filter(user => user !== userLogged);
        console.log("Updated shared with:", updatedSharedWith);
        //let updatedSharedWith = activity.sharedWith.filter(user => user.username !== userLogged);

        // Update the activity with the new sharedWith
        await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                sharedWith: updatedSharedWith.map(user => user._id),
            })
        });

        // if there are no more users assigned, update the status to Abandoned
        if (updatedSharedWith.length === 0) {
            await updateActivityStatus(activityId, "Abandoned", projectId);
            alert(`Activity ${activity.title} status updated to Abandoned.`);
        }
        await handleActivities(projectId);
    } catch (error) {
        console.error("Error abandoning activity:", error);
    }
}

// listener for the close button of handle activities
document.getElementById("closeActivityViewBtn").addEventListener("click", function () {
    document.getElementById("activity-container").style.display = "none";
    document.getElementById("closeActivityViewBtn").style.display = "none";
});