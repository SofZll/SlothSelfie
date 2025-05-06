// Function to handle activities status by the members of each activity or by the owner
async function handleActivities(projectId) {
    //adds loading message and spinner
    const container = document.getElementById("activity-container");
    container.innerHTML = `<div class="loading-container">
                        <div class="spinner"></div>
                        <p>Loading, please wait...</p>
                    </div>`;

    //updates the DOM to show the loading message
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        const userLogged = await getLoggedUser();
        if (!userLogged) {
            Swal.fire({title: "Error", text: "No user is logged in!", icon: "error"});
            return;
        }

        const projectResponse = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const data = await projectResponse.json();
        if (!data.success) {
            throw new Error('Failed to fetch project');
        }
        const project = data.project;

        // Check if the logged user is the owner or a member
        const isOwner = project.owner.username === userLogged;
        const isMember = project.members.some(member => member.username === userLogged);
        if (!isOwner && !isMember) {
            Swal.fire({title: "Error", text: "You can't handle the activities of this project", icon: "error"});
            return;
        }

        // Get activities: all if owner, only assigned if member, on top we show the macroactivity of the phase/subphase (only to the owner)
        // Get all activities from the project
        let activities = [];
        for (const phase of project.phases) {
            activities = activities.concat(phase.macroActivity);
            activities = activities.concat(phase.activities);
            for (const subphase of phase.subphases) {
                activities = activities.concat(subphase.macroActivity);
                activities = activities.concat(subphase.activities);
            }
        }

        if (!isOwner) {
            activities = activities.filter(activity => activity.sharedWith.some(user => user.username === userLogged));
        }

        //Render the activities
        renderActivities(activities, userLogged, isOwner);

        //Updates the activities status
        await updateActivitiesStatus(activities);

        //refetch after the update
        const refreshedProject = await fetch(`http://localhost:8000/api/project/${projectId}`);
        if (!refreshedProject.ok) {
            throw new Error("Failed to fetch the refreshed project data.");
        }
        const Data = await refreshedProject.json();
        if (!Data.success) {
            throw new Error("Refreshed project data is undefined.");
        }
        const refreshedProjectData = Data.project;

        // Reconstruct the activities array from the refreshed project
        let updatedActivities = [];
        for (const phase of refreshedProjectData.phases) {
            updatedActivities = updatedActivities.concat(phase.macroActivity);
            updatedActivities = updatedActivities.concat(phase.activities);
            for (const subphase of phase.subphases) {
                updatedActivities = updatedActivities.concat(subphase.macroActivity);
                updatedActivities = updatedActivities.concat(subphase.activities);
            }
        }

        if (!isOwner) {
            updatedActivities = updatedActivities.filter(activity => activity.sharedWith.some(user => user.username === userLogged));
        }

        // Re-render the activities to update the status from the refreshed project
        renderActivities(updatedActivities, userLogged, isOwner);

        //Updates the buttons
        await updateActivitiesStatus(updatedActivities);

    } catch (error) {
        console.error("Error handling activities of the project:", error);
    }
}

// Function to get the status of the input/output fields in handleActivities
function getActivityInputOutputStatus(activity, userLogged, isOwner, isAbandoned) {
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

    return [ inputDisabled, inputSelectDisabled, inputInsertDisabled, outputDisabled, outputSelectDisabled, outputInsertDisabled ];
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
            Swal.fire({title: "Error", text: "Invalid link. Please enter a valid URL.", icon: "error"});
            return;
        }

        let noteContent = "";
        if (inputType === "text" || inputType === "link") {
            noteContent = inputValue;
        }

        let userLogged = await getLoggedUser();

        try {
            const response = await fetch("http://localhost:8000/api/activity/inputOutput", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activityId: activityId,
                    content: noteContent,
                    userName: userLogged,
                    type: fieldType
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

            //we update the status of its macroActivity to Active
            await checkAndUpdateMacroStatus(activityId, type= "input");

        } catch (error) {
            console.error("Error saving activity input:", error);
        }
    } else if (fieldType === "output") {
        let outputType = document.getElementById(`output-type-${activityId}`).value;
        let outputValue = document.getElementById(`output-${activityId}`).value.trim();

        if (outputType === "link" && !isValidURL(outputValue)) {
            Swal.fire({title: "Error", text: "Invalid link. Please enter a valid URL.", icon: "error"});
            return;
        }
         noteContent = outputValue;
        let userLogged = await getLoggedUser();

        try {
            const response = await fetch("http://localhost:8000/api/activity/inputOutput", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activityId: activityId,
                    content: noteContent,
                    userName: userLogged,
                    type: fieldType
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

//Function to check if input/output of macro is present, if not so insert it
async function insertMacroInputOutput(activityId, fieldType, value = "") {
    let userLogged = await getLoggedUser();
    //get the activity
    const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
    const data = await response.json();
    if (!data.success) {
        throw new Error('Failed to fetch activity');
    }
    const activity = data.activity;

    if (fieldType === "input") {
        let inputType, inputValue;
        inputType = "text";
        inputValue = value;
        //check if the activity has already an input
        if(!activity.input){
            try{
            //insert the input in the macroactivity input field
            const response = await fetch("http://localhost:8000/api/activity/inputOutput", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activityId: activityId,
                    content: inputValue,
                    userName: userLogged,
                    type: fieldType
                })
            });
            if(!response.ok){
                console.error("Failed to save activity output.");
            }
        }catch (error) {
            console.error("Error saving activity input:", error);
        }
        }
    } else if (fieldType === "output") {
            let outputType, outputValue;
            outputType = "text";
            outputValue = value;
            //check if the activity has already an output
            if(!activity.output || activity.output === null){
                try{
                    //insert the output in the macroactivity output field
                    const response = await fetch("http://localhost:8000/api/activity/inputOutput", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            activityId: activityId,
                            content: outputValue,
                            userName: userLogged,
                            type: fieldType
                        })
                    
                    });
                    if(!response.ok){
                        console.error("Failed to save activity output.");
                    }
                }
                catch (error) {
                    console.error("Error saving activity output:", error);
                }
            }
    }
}

//Function to check if the macroactivity has at least one activity with input, if so the status is set as Active, and we insert the input if not present
//if the macroactivity has all the activities completed we set the status as completed, and we insert the mactoActivity output
//if the macroactivity is reactivated, we set the status as Reactivated and we clear the output field in the DOM
//We will consider the parent macro also (if the activity is in a subphase)
async function checkAndUpdateMacroStatus(activityId, type) {
    try {
        //get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to fetch activity');
        }
        const activity = data.activity;
        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        //get the phaseSubphase of the activity
        const responseData = await fetch(`http://localhost:8000/api/phaseSubphase/${activity.phaseSubphase}`);
        const phaseSubphaseData = await responseData.json();
        if (!phaseSubphaseData.success) {
            throw new Error('Failed to fetch phaseSubphase');
        }
        const phaseSubphase = phaseSubphaseData.phaseSubphase;

        //get the macroactivity of the phaseSubphase
        const macroActivity = phaseSubphase.macroActivity;

        if(phaseSubphase.type === "phase"){ //No need to update the macro of the father phase

            await handlePhaseMacro(macroActivity, phaseSubphase, type);

        }else if(phaseSubphase.type === "subphase"){
            //We will consider the parent macro phase also

            // we get the parentPhase
            let parentPhase = null;
            if (phaseSubphase.parentPhase) {
                const parentResponseres = await fetch(`http://localhost:8000/api/phaseSubphase/${phaseSubphase.parentPhase}`);
                const parentResponse = await parentResponseres.json();
                if (!parentResponse.success) {
                    throw new Error('Failed to fetch parent phaseSubphase');
                }
                parentPhase = parentResponse.phaseSubphase;
            }
            await handleSubphaseMacro(macroActivity, phaseSubphase, parentPhase, type);
      
        }
    } catch (error) {
        console.error("Error in checkAndUpdateMacroStatus:", error);
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
        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch activity');
        }
        const activity = data.activity;

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

        //we update the status of the macroActivity to Completed if all the activities of the macro have output
        await checkAndUpdateMacroStatus(activityId, type= "output");

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
        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to fetch activity');
        }
        const activity = data.activity;
        console.log('activity: ', activity);

        if (!activity) {
            console.error("Activity is undefined:", activity);
            return;
        }

        let { dependentActivities, activities } = await getDependentActivities(activityId);
        //get the ids of the dependent activities
        let dependentActivitiesIds = dependentActivities.map(dep => dep._id);

        // Filter the dependent activities that are Not_Activatable, or Overdue without input
        let blockedDependencies = dependentActivities.filter(dep => dep.status === "Not_Activatable" || (dep.status === "Overdue" && !dep.input));
        //get the ids of the blocked dependent activities
        let blockedDependenciesIds = blockedDependencies.map(dep => dep._id);

        // Check if the activity is overdue, comparing with today's date
        let today = await getCurrentNow();
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
        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to fetch activity');
        }
        const activity = data.activity;
        console.log('activity: ', activity);


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
                const dependentActivityData = await response.json();
                if (!dependentActivityData.success) {
                    throw new Error('Failed to fetch dependent activity');
                }
                const dependentActivity = dependentActivityData.activity;

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
        const projectData = await projectResponse.json();
        if (!projectData.success) {
            throw new Error('Failed to fetch project');
        }
        const project = projectData.project;
        //get the owner of the project
        const isOwner = project.owner.username === userLogged;
        const isMember = activity.sharedWith.some(user => user.username === userLogged);
        
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
        //we update the status of the macroActivity to Reactivated if all the activities of the macro were completed
        await checkAndUpdateMacroStatus(activityId, type= "reactivate");
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
        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to fetch activity');
        }
        const activity = data.activity;
        console.log('activity: ', activity);


        await updateDependentActivities(activityId, activity, onlyBlocked);

        // disable the buttons
        toggleElements([
            `delayBtn-${activityId}`, 
            `contractBtn-${activityId}`
        ], true);

        //eventually close the list/gantt view and the edit view
        document.getElementById("project-view-container").style.display = "none";
        document.getElementById("closeProjectViewBtn").style.display = "none"; // Hides the close view button
        document.getElementById("projectForm").style.display = "none";
        document.getElementById("ToggleFormBtn").textContent = "+ Add a Project";
        //remove the warning message
        let warningMessage = document.getElementById("dependencyWarning");
        if (warningMessage) {
            warningMessage.remove();
        }

    } catch (error) {
        console.error("Error handling owner decision:", error);
    }
}

// Function to get the dependent activities of an activity
async function getDependentActivities(activityId) {
    // Get the activity
    const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
    const data = await response.json();
    if (!data.success) {
        throw new Error('Failed to fetch activity');
    }
    const activity = data.activity;
    console.log('activity: ', activity);


    // Get the entire project to find all activities
    const projectResponse = await fetch(`http://localhost:8000/api/project/${activity.project}`);
    const projectdata = await projectResponse.json();
    if (!projectdata.success) {
        throw new Error('Failed to fetch project');
    }
    const project = projectdata.project;
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
            if (!onlyBlocked || (onlyBlocked && dependent.status === "Not_Activatable" || dependent.status === "Overdue")) {
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
    const res = await fetch(`http://localhost:8000/api/activity/${activityId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependentActivitiesIds, delay, action }) // action is "contract" or "delay"
    });
    const data = await res.json();
    // Update the dependent activities with the new startDate and/or deadline
    adjustDatesOfDependentActivities(dependentActivitiesIds);

    // update the deadlines of the macros in the DOM, if present
    if (data.updatedMacros) {
        updateMacroDeadlinesInDOM(data.updatedMacros);
    }
}

// Function to update the output note if the activity was reactivated and output was rejected (if output note is not present in some macro, create it)
async function updateOutputNote(activityId) {
    try {

        // Get the content of the output field
        let outputType = document.getElementById(`output-type-${activityId}`).value;
        let outputValue = document.getElementById(`output-${activityId}`).value.trim();

        if (outputType === "link" && !isValidURL(outputValue)) {
            Swal.fire({title: "Error", text: "Invalid link. Please enter a valid URL.", icon: "error"});
            return;
        }
        noteContent = outputValue;
        let userLogged = await getLoggedUser();

        //get the activity output note, if it is preent, update it, else create it
        const responseActivity = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activityData = await responseActivity.json();
        if (!activityData.success) {
            throw new Error('Failed to fetch activity');
        }
        const activity = activityData.activity;

        //get the output note
        const responseNote = await fetch(`http://localhost:8000/api/note/get/${activity.output}`);
        const noteData = await responseNote.json();
        if (!noteData.success) {
            throw new Error('Failed to fetch note');
        }
        const note = noteData.note;
        if (!note) {
            // If the note is not present, create it
            const response = await fetch(`http://localhost:8000/api/activity/inputOutput`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    activityId: activityId,
                    content: noteContent,
                    userName: userLogged,
                    type: "output"
                })
            });
            if (response.ok) {
                // After creating the output note, disable the output fields and the save button
                toggleElements([
                    `output-${activityId}`,
                    `output-type-${activityId}`,
                    `save-output-${activityId}`
                ], true);
                toggleElements([`complete-${activityId}`], false);
            }

        }else{

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
        }

    } catch (error) {
        console.error("Error updating output note:", error);
    }
}

//Function to get the content of the output note
async function getOutputContent(noteId) {
    try {
        const response = await fetch(`http://localhost:8000/api/note/get/${noteId}`);
        const outputData = await response.json();
        if (!outputData.success) {
            throw new Error('Failed to fetch output note');
        }
        const output = outputData.note;
        return output.content;
    } catch (error) {
        console.error("Error getting output content:", error);
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
        Swal.fire({title: "Success!", text: "You have abandoned this activity.", icon: "success"});

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

// listener for the close button of handle activities
document.getElementById("closeActivityViewBtn").addEventListener("click", function () {
    document.getElementById("activity-container").style.display = "none";
    document.getElementById("closeActivityViewBtn").style.display = "none";
});