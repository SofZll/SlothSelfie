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

                if (isLate && !isAbandoned) {
                    updateActivityStatus(activity._id, "Overdue");
                }
                if (isAbandoned) {
                    updateActivityStatus(activity._id, "Abandoned");
                }

                //if the activity is reactivated, the output note can be updated and the output field is enabled, we also show the save button
                if (activity.status === "Reactivated") {
                    reactivateActivity(activity._id, "Reactivated");
                }

                let star = activity.milestone ? "*" : ""; // milestone
                let inputDisabled = activity.input ? 'disabled' : '';  // Check if input already exists
                let inputSelectDisabled = activity.input ? 'disabled' : ''; // Disable the select if input exists
                let inputInsertDisabled = activity.input ? 'disabled' : ''; // Disable the button if input exists

                let outputDisabled = activity.output ? 'disabled' : ''; // Check if output already exists
                let outputSelectDisabled = activity.output ? 'disabled' : ''; // Disable the select if output exists
                let outputInsertDisabled = activity.output ? 'disabled' : ''; // Disable the button if output exists

                content += `
                    <li class="list-group-item">
                        <strong>${star}${activity.title}</strong>
                        <p id="status-${activity._id}">Status: ${activity.status}</p>
                        <br>
                        Input type: 
                        <select id="input-type-${activity._id}" ${inputSelectDisabled} onchange="updateInputOutputType('${activity._id}', 'input')">
                            <option value="text">Text</option>
                            <option value="empty">Empty</option>
                            <option value="link">Link</option>
                        </select>
                        <input type="text" id="input-${activity._id}" value="${activity.input?.content || ''}" ${inputDisabled}>
                        <button class="btn btn-outline-primary btn-sm" id="insert-input-${activity._id}" onclick="insertActivityInputOutput('${activity._id}', 'input')" ${inputInsertDisabled}>Insert Input</button>
                        
                        <label>Output type:</label>
                        <select id="output-type-${activity._id}" ${outputSelectDisabled} onchange="updateInputOutputType('${activity._id}', 'output')">
                            <option value="text">Text</option>
                            <option value="link">Link</option>
                            <option value="true">Completed</option>
                        </select>
                        <input type="text" id="output-${activity._id}" value="${activity.output?.content || ''}" ${outputDisabled}>
                        <button class="btn btn-outline-primary btn-sm" id="insert-output-${activity._id}" onclick="insertActivityInputOutput('${activity._id}', 'output')" ${outputInsertDisabled}>Insert Output</button>
                        <button class="btn btn-outline-success btn-sm" id="save-output-${activity._id}" onclick="updateOutputNote('${activity._id}', 'output')" style="display: none;">Save updated output</button>
                        `;
                    // shows the buttons for accept/reject output only if the user is the owner
                    if (isOwner) {
                        content += `
                            <button class="btn btn-outline-danger btn-sm" id="reactivate-${activity._id}" onclick="reactivateActivity('${activity._id}', 'Reactivated')">Reject output</button>
                        `;
                    }
                    content += `
                        <p>Deadline: ${new Date(activity.deadline).toLocaleDateString()}<p>
                        <button class="btn btn-success btn-sm" id="start-${activity._id}" onclick="startActivity('${activity._id}', 'Active')" ${!activity.input ? 'disabled' : ''}>Start</button>
                        <button class="btn btn-primary btn-sm" id="complete-${activity._id}" onclick="completeActivity('${activity._id}', 'Completed')" ${!activity.output ? 'disabled' : ''}>Complete</button>
                        <button class="btn btn-danger btn-sm" id="abandon-${activity._id}" onclick="abandonActivity('${activity._id}')">Abandon</button>
                    </li>
                `;
            });
            content += `</ul>`;
        }

        // Insert the content in the activity container
        activityContainer.innerHTML = content;
        activityContainer.style.display = "block";
        closeBtn.style.display = "block";

        //Function to disable/enable the buttons depending on the status of the activity
        activities.forEach(activity => {
            updateActivityButtons(activity._id, activity.status, isOwner);
        });

    } catch (error) {
        console.error("Error handling activities of the project:", error);
    }
}

// Function to update the buttons of an activity depending on its status
function updateActivityButtons(activityId, status, isOwner) {
    let startButton = document.getElementById(`start-${activityId}`);
    let completeButton = document.getElementById(`complete-${activityId}`);
    let abandonButton = document.getElementById(`abandon-${activityId}`);
    let reactivateButton = document.getElementById(`reactivate-${activityId}`);

    switch (status) {
        case "Not_Activatable":
        case "Completed":
            startButton.disabled = true;
            startButton.classList.add('disabled');
            completeButton.disabled = true;
            completeButton.classList.add('disabled');
            abandonButton.disabled = true;
            abandonButton.classList.add('disabled');
            break;

        case "Abandoned":
            startButton.disabled = true;
            startButton.classList.add('disabled');
            completeButton.disabled = true;
            completeButton.classList.add('disabled');
            abandonButton.disabled = true;
            abandonButton.classList.add('disabled');
            if(isOwner){
               reactivateButton.disabled = true;
               reactivateButton.classList.add('disabled');
            }
            break;

        case "Activatable":
            abandonButton.disabled = true;
            abandonButton.classList.add('disabled');
            break;

        case "Active":
            startButton.disabled = true;
            startButton.classList.add('disabled');
            abandonButton.disabled = false;
            abandonButton.classList.remove('disabled');
            break;

        case "Reactivated":
            startButton.disabled = true;
            startButton.classList.add('disabled');
            completeButton.disabled = true;
            completeButton.classList.add('disabled');
            break;
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
        let outputField = document.getElementById(`output-${activityId}`);

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

            //disable the input field
            let inputField = document.getElementById(`input-${activityId}`);
            if (inputField) {
                inputField.disabled = true;
            }

            //disable the input select
            let inputSelect = document.getElementById(`input-type-${activityId}`);
            if (inputSelect) {
                inputSelect.disabled = true;
            }

             // Update activity status to Activatable
            await updateActivityStatus(activityId, "Activatable");

            //set the start button to be not disabled
            let startButton = document.getElementById(`start-${activityId}`);
            if (startButton) {
                startButton.disabled = false;
                startButton.classList.remove('disabled');
            }

        } catch (error) {
            console.error("Error saving activity input:", error);
        }
    } else if (fieldType === "output") {
        let outputType = document.getElementById(`output-type-${activityId}`).value;
        let outputValue = document.getElementById(`output-${activityId}`).value.trim();

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

            //disable the output field
            let outputField = document.getElementById(`output-${activityId}`);
            if (outputField) {
                outputField.disabled = true;
            }

            //disable the output select
            let outputSelect = document.getElementById(`output-type-${activityId}`);
            if (outputSelect) {
                outputSelect.disabled = true;
            }

            //set the complete button to be not disabled
            let completeButton = document.getElementById(`complete-${activityId}`);
            if (completeButton) {
                completeButton.disabled = false;
                completeButton.classList.remove('disabled');
            }

        } catch (error) {
            console.error("Error saving activity output:", error);
        }
    }
}

// Function to update activity status
async function updateActivityStatus(activityId, newStatus) {
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
            // Update the status in the DOM
            let statusElement = document.getElementById(`status-${activityId}`);
            if (statusElement) {
                statusElement.innerText = `Status: ${newStatus}`;
            }
        }
    } catch (error) {
        console.error("Error updating activity:", error);
    }
}

// Function to start an activity
async function startActivity(activityId, newStatus) {
    try {
        //get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        // Update the activity status
        await updateActivityStatus(activityId, newStatus);

        //button abandon is activated and the start button is disabled
        let abandonButton = document.getElementById(`abandon-${activityId}`);
        if (abandonButton) {
            abandonButton.disabled = false;
            abandonButton.classList.remove('disabled');
        }

        let startButton = document.getElementById(`start-${activityId}`);
        if (startButton) {
            startButton.disabled = true;
            startButton.classList.add('disabled');
        }
    }
    catch (error) {
        console.error("Error starting activity:", error);
    }
}

// Function to complete an activity
async function completeActivity(activityId, newStatus) {
    try {
        //get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        // Update the activity status
        await updateActivityStatus(activityId, newStatus);

        //button abandon, start and complete are disabled
        let abandonButton = document.getElementById(`abandon-${activityId}`);
        if (abandonButton) {
            abandonButton.disabled = true;
            abandonButton.classList.add('disabled');
        }

        let startButton = document.getElementById(`start-${activityId}`);
        if (startButton) {
            startButton.disabled = true;
            startButton.classList.add('disabled');
        }

        let completeButton = document.getElementById(`complete-${activityId}`);
        if (completeButton) {
            completeButton.disabled = true;
            completeButton.classList.add('disabled');
        }

    } catch (error) {
        console.error("Error completing activity:", error);
    }
}

//Function to reactivate an activity
async function reactivateActivity(activityId, newStatus) {
    try {
        //get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        if(activity.status !== "Reactivated"){
        // Update the activity status
        await updateActivityStatus(activityId, newStatus);
        }

        //reactivates the button abandon
        let abandonButton = document.getElementById(`abandon-${activityId}`);
        if (abandonButton) {
            abandonButton.disabled = false;
            abandonButton.classList.remove('disabled');
        }

        // Shows the "Save updated output" button and activates it
        let saveOutputButton = document.getElementById(`save-output-${activityId}`);
        if (saveOutputButton) {
            saveOutputButton.style.display = "inline-block";
            saveOutputButton.disabled = false;
            saveOutputButton.classList.remove("disabled");
        }

        // reactivates the output select
        let outputSelect = document.getElementById(`output-type-${activityId}`);
        if (outputSelect) {
            outputSelect.disabled = false;
        }

        // Reactivates the output field
        let outputField = document.getElementById(`output-${activityId}`);
        if (outputField) {
            outputField.disabled = false;
        }

    } catch (error) {
        console.error("Error reactivating activity:", error);
    }
}

// Function to update the output note if the activity was reactivated and output was rejected
async function updateOutputNote(activityId) {
    try {

        // Get the content of the output field
        let outputType = document.getElementById(`output-type-${activityId}`).value;
        let outputValue = document.getElementById(`output-${activityId}`).value.trim();

        if (outputType === "link" && !isValidURL(outputValue)) {
            alert("Invalid link. Please enter a valid URL.");
            return;
        }
        noteContent = outputValue;
        let userLogged = await getLoggedUser();

        // Update the output note
        const response = await fetch(`http://localhost:8000/api/activity/output/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                activityId: activityId,
                content: noteContent,
                userName: userLogged,
            })
        });

        
        if (response.ok) {
            // After updating the output note, disable the output fields and the save button

            //disable the output field
            let outputField = document.getElementById(`output-${activityId}`);
            if (outputField) {
                outputField.disabled = true;
            }
            //disable the output select
            let outputSelect = document.getElementById(`output-type-${activityId}`);
            if (outputSelect) {
                outputSelect.disabled = true;
            }
            //disable the save button
            let saveOutputButton = document.getElementById(`save-output-${activityId}`);
            if (saveOutputButton) {
                saveOutputButton.disabled = true;
                saveOutputButton.classList.add("disabled");
            }

            //unable the complete button
            let completeButton = document.getElementById(`complete-${activityId}`);
            if (completeButton) {
                completeButton.disabled = false;
                completeButton.classList.remove('disabled');
            }
        }

    } catch (error) {
        console.error("Error updating output note:", error);
    }
}

// Function to abandon an activity if no more users are assigned
async function abandonActivity(activityId) {
    try {
        const userLogged = await getLoggedUser();

        // Get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }
        
        // Remove the logged user from sharedWith
        let updatedSharedWith = activity.sharedWith.filter(user => user !== userLogged);

        // Update the activity with the new sharedWith
        await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                sharedWith: updatedSharedWith,
            })
        });

        // if there are no more users assigned, update the status to Abandoned and disable the abandon button, and the reject output button
        if (updatedSharedWith.length === 0) {
            await updateActivityStatus(activityId, "Abandoned");

            let abandonButton = document.getElementById(`abandon-${activityId}`);
            if (abandonButton) {
                abandonButton.disabled = true;
                abandonButton.classList.add('disabled');
            }

            let reactivateButton = document.getElementById(`reactivate-${activityId}`);
            if (reactivateButton) {
                reactivateButton.disabled = true;
                reactivateButton.classList.add('disabled');
            }
        }
    } catch (error) {
        console.error("Error abandoning activity:", error);
    }
}

// listener for the close button of handle activities
document.getElementById("closeActivityViewBtn").addEventListener("click", function () {
    document.getElementById("activity-container").style.display = "none";
    document.getElementById("closeActivityViewBtn").style.display = "none";
});