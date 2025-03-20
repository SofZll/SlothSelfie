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

        // Async operations to resolve
        let asyncOperations = [];

        // Show the activities
        let activityContainer = document.getElementById("activity-container");
        let closeBtn = document.getElementById("closeActivityViewBtn");

        let content = `<h2>Project Activities</h2>`;
        if (activities.length === 0) {
            content += `<p>No activities assigned to you.</p>`;
        } else {
            content += `<ul class="list-group">`;
            
            for (const activity of activities) {

                //if the activity is completed, we check if it has dependencies and show the buttons for the owner to decide in case of delay              
                if (activity.status === "Completed") {
                    asyncOperations.push(checkOptionsForCompleteActivityDep(activity._id, false));
                }

                // Check if the activity has a deadline and if it is Overdue or Abandoned
                let today = new Date();       //TODO, TIME MACHINE DATE
                today.setHours(0, 0, 0, 0);    //we only compare the day, not the hours
                let deadline = new Date(activity.deadline);

                let isLate = today > deadline && !activity.output; // Overdue without output
                let isAbandoned = today - deadline > 7 * 24 * 60 * 60 * 1000; // Overdue since last 7 days
                //if the activity has no members assigned, it is abandoned
                let isAbandonedNoParticipants = false;
                if (activity.sharedWith.length === 0) {
                    isAbandonedNoParticipants = true;
                }

                if (isLate && !isAbandoned && !isAbandonedNoParticipants) {
                    asyncOperations.push(updateActivityStatus(activity._id, "Overdue"));
                }
                if (isAbandoned || isAbandonedNoParticipants) {
                    asyncOperations.push(updateActivityStatus(activity._id, "Abandoned"));
                }

                //if members are re-added, the activity will be Not_Activatable in case of no input, and Activatable otherwise
                if (activity.sharedWith.length > 0 && activity.status === "Abandoned") {
                    if (!activity.input) {
                        asyncOperations.push(updateActivityStatus(activity._id, "Not_Activatable"));
                    } else {
                        asyncOperations.push(activatableActivity(activity._id, "Activatable"));
                    }
                }

                //if the activity is reactivated, the output note can be updated and the output field is enabled, we also show the save button and adjust dependencies input
                if (activity.status === "Reactivated") {
                    asyncOperations.push(reactivateActivity(activity._id, "Reactivated"));
                }

                let star = activity.milestone ? "*" : ""; // milestone

                //if the activity ha dependencies, or if input already exists, the input field is disabled
                let inputDisabled = (activity.dependencies && activity.dependencies.length > 0) || activity.input ? 'disabled' : '';
                let inputSelectDisabled = (activity.dependencies && activity.dependencies.length > 0) || activity.input ? 'disabled' : ''; // Disable the select
                let inputInsertDisabled = (activity.dependencies && activity.dependencies.length > 0) || activity.input ? 'disabled' : ''; // Disable the button

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
                    // shows the buttons for reject output only if the user is the owner
                    if (isOwner) {
                        content += `
                            <button class="btn btn-outline-danger btn-sm" id="reactivate-${activity._id}" onclick="reactivateActivity('${activity._id}', 'Reactivated')">Reject output</button>
                         `;
                         
                         //div for the buttons for the owner to decide if the next activities should be delayed or contracted in case of delay
                         content += `
                         <div id="activity-${activity._id}-buttons-container"></div>
                        `;
                    }
                    content += `
                        <p id="startDate-${activity._id}">Start Date: ${new Date(activity.startDate).toLocaleDateString()}<p>
                        <p id="deadline-${activity._id}">Deadline: ${new Date(activity.deadline).toLocaleDateString()}<p>
                        <button class="btn btn-success btn-sm" id="start-${activity._id}" onclick="startActivity('${activity._id}', 'Active')" ${!activity.input ? 'disabled' : ''}>Start</button>
                        <button class="btn btn-primary btn-sm" id="complete-${activity._id}" onclick="completeActivity('${activity._id}', 'Completed')" ${!activity.output ? 'disabled' : ''}>Complete</button>
                        <button class="btn btn-danger btn-sm" id="abandon-${activity._id}" onclick="abandonActivity('${activity._id}')">Abandon</button>
                    </li>
                    `;                
            }
            content += `</ul>`;
        }

        // Insert the content in the activity container
        activityContainer.innerHTML = content;
        activityContainer.style.display = "block";
        closeBtn.style.display = "block";

        // Wait for all async operations to finish
        await Promise.all(asyncOperations);

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

// Function to insert an input/output for an activity and create a note, the field  value = "" is optional for the dependency input case
async function insertActivityInputOutput(activityId, fieldType, isDependency = false, value = "") {
    if (fieldType === "input") {

        let inputType, inputValue; 

        if (!isDependency) {
            inputType = document.getElementById(`input-type-${activityId}`).value;
            inputValue = document.getElementById(`input-${activityId}`).value.trim();
        }else{
            inputType = "text";
            inputValue = value;

            // We put the input value in the DOM input field
            let inputField = document.getElementById(`input-${activityId}`);
            if (inputField) {
                inputField.value = inputValue;
            }
        }

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

            //change status and start button
            activatableActivity(activityId, "Activatable");

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

//Function to set the activity as activable
async function activatableActivity(activityId, newStatus) {
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

         //set the start button to be not disabled
         let startButton = document.getElementById(`start-${activityId}`);
         if (startButton) {
             startButton.disabled = false;
             startButton.classList.remove('disabled');
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

        // Disable buttons
        ["abandon", "start", "complete"].forEach(action => {
            let button = document.getElementById(`${action}-${activityId}`);
            if (button) {
                button.disabled = true;
                button.classList.add('disabled');
            }
        });

        // If the activity has dependencies, update them:
        await checkOptionsForCompleteActivityDep(activityId, true);

    } catch (error) {
        console.error("Error completing activity:", error);
    }
}

//Function to check what to do with dependencies when we complete an activity
//(in case of userDecision=false, no button completed was pressed and we are in the fetch case)
async function checkOptionsForCompleteActivityDep(activityId, userDecision = false) {
    try {
        // Get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        let { dependentActivities, activities } = await getDependentActivities(activityId);
        //get the ids of the dependent activities
        let dependentActivitiesIds = dependentActivities.map(dep => dep._id);

        // Filter the dependent activities that are Not_Activatable
        let blockedDependencies = dependentActivities.filter(dep => dep.status === "Not_Activatable");
        //get the ids of the blocked dependent activities
        let blockedDependenciesIds = blockedDependencies.map(dep => dep._id);

        // Check if the activity is overdue, comparing with today's date
        let today = new Date();         //TODO, TIME MACHINE DATE
        today.setHours(0, 0, 0, 0);    //we only compare the day, not the hours
        let deadlineDate = new Date(activity.deadline);

        let isOverdue = deadlineDate < today;  // the completed activity has delay?
        //we calculate the days of delay
        let delay = Math.ceil((today - deadlineDate) / (1000 * 60 * 60 * 24));
        let hasBlockedDependencies = blockedDependencies.length > 0;  // Are there blocked dependencies? (in case they were added in edit after complete)

        if(dependentActivities && dependentActivities.length > 0){

            //the owner has clicked "complete"
            if(userDecision){
                if (isOverdue) {
                    // If it is a milestone, contract the schedule first
                    if (activity.milestone) {
                        //await contractActivitySchedule(activityId, dependentActivitiesIds, delay);
                        await adjustOrContractActivitySchedule(activityId, dependentActivitiesIds, delay, "contract");
                        await updateDependentActivities(activityId, activity);
                    } else {
                        // We ask the owner if the activity should be delayed or contracted, until the owner decides, the dependencies are not activated
                        createAndShowDependencyButtons(activityId, dependentActivitiesIds, delay); //We show the buttons for the owner to decide
                    }
                } else {
                    // If the activity is not overdue, update the dependent activities:
                    await updateDependentActivities(activityId, activity);
                }
            }else{
                //we are in the fetch case, if there are blocked dependencies, we update them in each case, or show the buttons for the owner to decide
                if (hasBlockedDependencies) {
                     if(isOverdue){
                        if(activity.milestone){
                            //await contractActivitySchedule(activityId, blockedDependenciesIds, delay);
                            await adjustOrContractActivitySchedule(activityId, blockedDependenciesIds, delay, "contract");
                            await updateDependentActivities(activityId, activity, true);
                        }else{
                            createAndShowDependencyButtons(activityId, blockedDependenciesIds, delay, true);
                        }
                    }else{
                        await updateDependentActivities(activityId, activity, true);
                    }
                }
            }
        }

    } catch (error) {
        console.error("Error checking options for completed activity dependencies:", error);
    }
}

//Function to reactivate an activity, when we reject the output
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

        // if there are dependencies, we set the input as empty and the status as not activatable, the output of the dependency is deleted, if any
        // Get the dependencies of the activity
        let { dependentActivities, activities } = await getDependentActivities(activityId);

        for (let dependent of dependentActivities) {

            // remove the input from the dependent activity if it exists
            let inputField = document.getElementById(`input-${dependent._id}`);
            let inputValue = document.getElementById(`input-${dependent._id}`).value.trim();

            if (inputField && (inputValue !== "")) {
                inputField.disabled = true;
                inputField.value = "";

                //we get the dependent activity
                const response = await fetch(`http://localhost:8000/api/activity/${dependent._id}`);
                const dependentActivity = await response.json();

                //delete the input note
                await deleteNoteById(dependentActivity.input);
                //delete the output note, if any, and we clear the output field in the DOM

                let outputField = document.getElementById(`output-${dependent._id}`);
                if (outputField.value !== "") {
                    await deleteNoteById(dependentActivity.output);
                    outputField.value = "";
                }
            }

            // We update the status of the dependent activity to Not_Activatable
            await updateActivityStatus(dependent._id, "Not_Activatable");
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

        //hides the two buttons for the owner to decide if present
        let container = document.getElementById(`activity-${activityId}-buttons-container`);
        if (container) {
            container.innerHTML = "";
        }

    } catch (error) {
        console.error("Error reactivating activity:", error);
    }
}

// Function to handle the owner decision
async function handleOwnerDecision(activityId, decision, dependentActivitiesIds, delay, onlyBlocked = false) {
    try {
        if (decision === "delay") {
            //await adjustActivitySchedule(activityId, dependentActivitiesIds, delay);
            await adjustOrContractActivitySchedule(activityId, dependentActivitiesIds, delay, decision);
        } else if (decision === "contract") {
            //await contractActivitySchedule(activityId, dependentActivitiesIds, delay);
            await adjustOrContractActivitySchedule(activityId, dependentActivitiesIds, delay, decision);
        }
        // Update the dependent activities
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        await updateDependentActivities(activityId, activity, onlyBlocked);

        // disable the buttons
        document.getElementById(`delayBtn-${activityId}`).disabled = true;
        document.getElementById(`delayBtn-${activityId}`).classList.add('disabled');
        document.getElementById(`contractBtn-${activityId}`).disabled = true;
        document.getElementById(`contractBtn-${activityId}`).classList.add('disabled');

    } catch (error) {
        console.error("Error handling owner decision:", error);
    }
}

// Function to create and show the buttons for the owner to decide
function createAndShowDependencyButtons(activityId, dependentActivitiesIds, delay, onlyBlocked = false) {

    const container = document.getElementById(`activity-${activityId}-buttons-container`);
    if (container) {
        container.innerHTML = `
            <button class="btn btn-outline-warning btn-sm" id="delayBtn-${activityId}" onclick="handleOwnerDecision('${activityId}', 'delay', '${dependentActivitiesIds}', '${delay}', '${onlyBlocked}')">Adjust dependencies</button>
            <button class="btn btn-outline-warning btn-sm" id="contractBtn-${activityId}" onclick="handleOwnerDecision('${activityId}', 'contract', '${dependentActivitiesIds}', '${delay}', '${onlyBlocked}')" >Contract dependencies</button>
        `;
    } else {
        console.error('Container not found for activity buttons');
    }
}

// Function to get the dependent activities of an activity
async function getDependentActivities(activityId) {
    // Get the activity
    const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
    const activity = await response.json();

    // Get the entire project to find all activities
    const projectResponse = await fetch(`http://localhost:8000/api/project/${activity.project}`);
    const project = await projectResponse.json();
    let activities = project.phases.flatMap(phase => phase.activities)
                    .concat(project.phases.flatMap(phase => phase.subphases.flatMap(sub => sub.activities)));
    
    // Find activities that depend on the completed one
    const dependentActivities = activities.filter(a => a.dependencies.some(dep => dep._id === activityId));
    return { dependentActivities, activities };
}

// Function to update the dependent activities of a completed activity, with option to update only blocked ones
async function updateDependentActivities(activityId, activity, onlyBlocked = false) {
    try {
        let { dependentActivities, activities } = await getDependentActivities(activityId);
        
        for (let dependent of dependentActivities) {
             // if onlyBlocked is true, we update only the blocked activities
            if (!onlyBlocked || (onlyBlocked && dependent.status === "Not_Activatable")) {
                // Verify if all dependencies are completed
                let dependenciesCompleted = dependent.dependencies.every(dep => {
                    let dependency = activities.find(a => a._id.toString() === dep._id.toString());
                    return dependency && dependency.status === "Completed";
                });

                if (dependenciesCompleted) {
                    await activatableActivity(dependent._id, "Activatable");

                    // We set the output of the previous activity as the input of the next one, only if it exists
                    if (activity.output) {

                        let outputId = typeof activity.output === "object" ? activity.output._id : activity.output;

                        // we get the output content from the output note
                        let outputContent = await getOutputContent(outputId);

                        await insertActivityInputOutput(dependent._id, 'input',true, outputContent);
                    }
                }            
            }
        }
    } catch (error) {
        console.error("Error updating dependent activities:", error);
    }
}

// Function to adjust or contract the schedule of an activity
async function adjustOrContractActivitySchedule(activityId, dependentActivitiesIds, delay, action) {
    await fetch(`http://localhost:8000/api/activity/${activityId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependentActivitiesIds, delay, action }) // action is "contract" or "delay"
    });

    // Update the dependent activities with the new startDate and/or deadline
    adjustDatesOfDependentActivities(dependentActivitiesIds);
}

/* */
/*
//Function to adjust the schedule of an activity
async function adjustActivitySchedule(activityId, dependentActivitiesIds, delay) {
    await fetch(`http://localhost:8000/api/activity/${activityId}/adjustSchedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependentActivitiesIds, delay })
    });

    // Update the dependent activities with the new deadline
    adjustDatesOfDependentActivities(dependentActivitiesIds);
}
*/
/* */
/*
//Function to contract the schedule of an activity
async function contractActivitySchedule(activityId, dependentActivitiesIds, delay) {
    await fetch(`http://localhost:8000/api/activity/${activityId}/contractSchedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependentActivitiesIds, delay })
    });

    // Update the dependent activities with the new deadline
    adjustDatesOfDependentActivities(dependentActivitiesIds);
}
*/

//Function to adjust the deadline of the dependent activities in the DOM
async function adjustDatesOfDependentActivities(dependentActivitiesIds) {
    //convert the dependentActivitiesIds to an array of ObjectIds
    const activityIdsArray = Array.isArray(dependentActivitiesIds)
    ? dependentActivitiesIds
    : dependentActivitiesIds.split(',').map(id => id.trim());

    for (const depId of activityIdsArray) {
        try {
            // Get the activity
            let response = await fetch(`http://localhost:8000/api/activity/${depId}`);
            let activity = await response.json();
            
            let newStartDate = new Date(activity.startDate);
            let newDeadline = new Date(activity.deadline);

            // Update the startDate in the DOM
            let startDateElement = document.getElementById(`startDate-${depId}`);
            if (startDateElement) {
                startDateElement.innerText = `Start Date: ${newStartDate.toLocaleDateString()}`;
            }

            // Update the deadline in the DOM
            let deadlineElement = document.getElementById(`deadline-${depId}`);
            if (deadlineElement) {
                deadlineElement.innerText = `Deadline: ${newDeadline.toLocaleDateString()}`;
            }
        } catch (error) {
            console.error(`Error updating the activity ${depId}:`, error);
        }
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

//Function to get the content of the output note
async function getOutputContent(noteId) {
    try {
        const response = await fetch(`http://localhost:8000/api/note/${noteId}`);
        const output = await response.json();
        return output.content;
    } catch (error) {
        console.error("Error getting output content:", error);
    }
}

//Function to delete a note by its id (used for input/output dependency if the output is rejected)
async function deleteNoteById(noteId) {
    try {
        const response = await fetch(`http://localhost:8000/api/note/${noteId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to delete note.");
        }
    } catch (error) {
        console.error("Error deleting note:", error);
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