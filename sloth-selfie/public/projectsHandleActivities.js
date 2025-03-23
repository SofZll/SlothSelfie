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
                    if (activity.status !== "Abandoned") {
                        asyncOperations.push(updateActivityStatus(activity._id, "Abandoned"));
                    }
                }
                //if members are re-added, and the activity is not overdue since last 7 days, the activity will be Not_Activatable in case of no input, Activatable otherwise,  Active it has output also
                if (activity.sharedWith.length > 0 && activity.status === "Abandoned") {
                    if(!isAbandoned){
                        if (!activity.input  && activity.status !== "Not_Activatable") {
                            asyncOperations.push(updateActivityStatus(activity._id, "Not_Activatable"));
                        } else if (activity.input && !activity.output &&  activity.status !== "Activatable")  {
                            asyncOperations.push(activatableActivity(activity._id, "Activatable"));
                        } else if (activity.output && activity.status !== "Active") {
                            asyncOperations.push(updateActivityStatus(activity._id, "Active"));
                        }
                    }
                }

                //if the activity is reactivated, the output note can be updated and the output field is enabled, we also show the save button and adjust dependencies input
                if (activity.status === "Reactivated") {
                    asyncOperations.push(reactivateActivity(activity._id, "Reactivated"));
                }

                let star = activity.milestone ? "*" : ""; // milestone

                //If the owner of the project is not a member of the activity, we will show the activity fields but he will not be able to interact with them (only the reject output button will be enabled)
                const isMember = activity.sharedWith.some(member => member.username === userLogged);
                const OwnerNotMember = isOwner && !isMember;

                //if the activity has dependencies, or if input already exists, or if if ownerNotMember, the input field is disabled
                let inputDisabled = (activity.dependencies && activity.dependencies.length > 0) || activity.input || OwnerNotMember || isAbandoned ? 'disabled' : '';
                let inputSelectDisabled = (activity.dependencies && activity.dependencies.length > 0) || activity.input || OwnerNotMember || isAbandoned ? 'disabled' : ''; // Disable the select
                let inputInsertDisabled = (activity.dependencies && activity.dependencies.length > 0) || activity.input || OwnerNotMember || isAbandoned ? 'disabled' : ''; // Disable the button

                let outputDisabled = activity.output || activity.status !== "Active" || OwnerNotMember || isAbandoned ? 'disabled' : ''; // Check if output already exists or if we are not in the "Active" case
                let outputSelectDisabled = activity.output || activity.status !== "Active" || OwnerNotMember || isAbandoned ? 'disabled' : ''; // Disable the select if output exists
                let outputInsertDisabled = activity.output || activity.status !== "Active" || OwnerNotMember || isAbandoned ? 'disabled' : ''; // Disable the button if output exists

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
                        // Disable the button if the activity is not Completed
                        let rejectDisabled = activity.status !== "Completed" ? 'disabled' : '';
                        content += `
                            <button class="btn btn-outline-danger btn-sm" id="reactivate-${activity._id}" onclick="reactivateActivity('${activity._id}', 'Reactivated')" ${rejectDisabled}>Reject output</button>
                         `;
                         
                         //div for the buttons for the owner to decide if the next activities should be delayed or contracted in case of delay
                         content += `
                         <div id="activity-${activity._id}-buttons-container"></div>
                        `;
                    }

                    let abandonDisabled = !activity.sharedWith.some(user => user.username === userLogged) ? 'disabled' : '';

                    content += `
                        <p id="startDate-${activity._id}">Start Date: ${new Date(activity.startDate).toLocaleDateString()}<p>
                        <p id="deadline-${activity._id}">Deadline: ${new Date(activity.deadline).toLocaleDateString()}<p>
                        <button class="btn btn-success btn-sm" id="start-${activity._id}" onclick="startActivity('${activity._id}', 'Active')" ${!activity.input ? 'disabled' : ''}>Start</button>
                        <button class="btn btn-primary btn-sm" id="complete-${activity._id}" onclick="completeActivity('${activity._id}', 'Completed')" ${!activity.output ? 'disabled' : ''}>Complete</button>
                        <button class="btn btn-danger btn-sm" id="abandon-${activity._id}" onclick="abandonActivity('${activity._id}')" ${abandonDisabled}>Abandon</button>
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
        for (const activity of activities) {
            const isMember = activity.sharedWith.some(member => member.username === userLogged);
            const OwnerNotMember = isOwner && !isMember;
            await updateActivityButtons(activity._id, isOwner, OwnerNotMember);
        }
    } catch (error) {
        console.error("Error handling activities of the project:", error);
    }
}

// Function to update the buttons of an activity depending on its status
async function updateActivityButtons(activityId, isOwner, ownerNotMember) {
    try{

        //get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        const startBtn = `start-${activityId}`;
        const completeBtn = `complete-${activityId}`;
        const abandonBtn = `abandon-${activityId}`;
        const reactivateBtn = `reactivate-${activityId}`;

        // If the owner of the project is not a member of the activity, we will not activate the buttons
        if (ownerNotMember) {
            toggleElements([startBtn, completeBtn, abandonBtn], true);
            return;
        }

        switch (activity.status) {
            case "Not_Activatable":
            case "Completed":
                toggleElements([startBtn, completeBtn, abandonBtn], true);
                break;

            case "Abandoned":
                toggleElements([startBtn, completeBtn, abandonBtn], true);
                if (isOwner) {
                    toggleElements([reactivateBtn], true);
                }
                break;

            case "Activatable":
                toggleElements([abandonBtn], true);
                break;

            case "Active":
                toggleElements([startBtn], true);
                toggleElements([abandonBtn], false);
                break;

            case "Reactivated":
                toggleElements([startBtn, completeBtn], true);
                break;
            
            case "Overdue":
                if(!activity.input){
                    toggleElements([abandonBtn], true);
                }
                else if(activity.output){
                    toggleElements([startBtn], true);
                }
                break;
        }
    }catch(error){
        console.error("Error updating activity buttons:", error);
    }
}

// Function to update the input/output type of an activity
function updateInputOutputType(activityId, fieldType) {
    const typeField = document.getElementById(`${fieldType}-type-${activityId}`);
    const field = document.getElementById(`${fieldType}-${activityId}`);

    if (!typeField || !field) return;

    const isDisabled = fieldType === "input" ? typeField.value === "empty" : typeField.value === "true";
    
    field.disabled = isDisabled;
    field.value = isDisabled ? (fieldType === "output" ? "Completed" : "") : "";
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

            // Disable the Insert Input button and fields after successful submission
            toggleElements([
                `insert-input-${activityId}`,
                `input-${activityId}`,
                `input-type-${activityId}`
            ], true);

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

            // Disable the Insert Output button and fields after successful submission
            toggleElements([
                `insert-output-${activityId}`,
                `output-${activityId}`,
                `output-type-${activityId}`
            ], true);

            //enable the complete button
            toggleElements([`complete-${activityId}`], false);

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

        //enable the start button
        toggleElements([`start-${activityId}`], false);
        
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

        //the start button is disabled
        toggleElements([`start-${activityId}`], true);

        //button abandon is activated and the output field is enabled
        toggleElements([
            `abandon-${activityId}`,
            `output-${activityId}`,
            `output-type-${activityId}`,
            `insert-output-${activityId}`
        ], false);

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

        // Disable buttons "abandon" and "complete"
        toggleElements([
            `abandon-${activityId}`,
            `complete-${activityId}`
        ], true);

        //enable the reject output button for the owner
        toggleElements([`reactivate-${activityId}`], false);

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

        //if the user is the owner of the project, but is not a member of the activity, we will not activate the saveUpdatedOutput nor the abandon button 
        let userLogged = await getLoggedUser();
        //get the project of the activity
        const projectResponse = await fetch(`http://localhost:8000/api/project/${activity.project}`);
        const project = await projectResponse.json();
        //get the owner of the project
        const isOwner = project.owner.username === userLogged;
        const isMember = activity.sharedWith.includes(userLogged);
        
        if(isOwner && !isMember){
            //we will not activate the saveUpdatedOutput nor the abandon button
            toggleElements([`save-output-${activityId}`,
                            `abandon-${activityId}`
                        ], true);
        }else{
            // Reactivates the buttons and fields
            toggleElements([
                `abandon-${activityId}`,
                `save-output-${activityId}`,
                `output-type-${activityId}`,
                `output-${activityId}`
            ], false);
        }

        // Show the "Save updated output" button
        let saveOutputButton = document.getElementById(`save-output-${activityId}`);
        if (saveOutputButton) {
            saveOutputButton.style.display = "inline-block";
        }

        // Disables the reject button
        toggleElements([`reactivate-${activityId}`], true);

        // Hides the two buttons for the owner to decide if present
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
        await adjustOrContractActivitySchedule(activityId, dependentActivitiesIds, delay, decision);

        // Update the dependent activities
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activity = await response.json();

        await updateDependentActivities(activityId, activity, onlyBlocked);

        // disable the buttons
        toggleElements([
            `delayBtn-${activityId}`, 
            `contractBtn-${activityId}`
        ], true);

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

            toggleElements([
                `output-${activityId}`,
                `output-type-${activityId}`,
                `save-output-${activityId}`
                ], true);

            toggleElements([`complete-${activityId}`], false);

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

        //send an alert to the logged user
        alert("You have abandoned this activity.");

        //disable the abandon button for the user
        toggleElements([`abandon-${activityId}`], true);

        // if there are no more users assigned, update the status to Abandoned
        if (updatedSharedWith.length === 0) {
            await updateActivityStatus(activityId, "Abandoned");
        }

        //disable the abandon button, the reject output button, the input/output elements, the saveupdated output button and the complete button
        toggleElements([
            `abandon-${activityId}`,
            `input-${activityId}`,
            `output-${activityId}`,
            `input-type-${activityId}`,
            `output-type-${activityId}`,
            `insert-input-${activityId}`,
            `insert-output-${activityId}`,
            `save-output-${activityId}`,
            `complete-${activityId}`
        ], true);

    } catch (error) {
        console.error("Error abandoning activity:", error);
    }
}

// Function to disable/enable elements by their ids: true if we disable, false if we enable
function toggleElements(elementIds, disable = true, toggleClass = true) {
    elementIds.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
            element.disabled = disable;
            if (toggleClass) {
                element.classList.toggle("disabled", disable);
            }
        }
    });
}

// listener for the close button of handle activities
document.getElementById("closeActivityViewBtn").addEventListener("click", function () {
    document.getElementById("activity-container").style.display = "none";
    document.getElementById("closeActivityViewBtn").style.display = "none";
});