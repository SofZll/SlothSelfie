//Function to update the activities status in handleActivities
async function updateActivitiesStatus(activities) {
    let asyncOperations = [];

    for (const activity of activities) {
        //if the activity is completed, we check if it has dependencies and show the buttons for the owner to decide in case of delay              
        if (activity.status === "Completed") {
            asyncOperations.push(checkOptionsForCompleteActivityDep(activity._id, false));

            if(activity.isMacroactivity){
                //we check if new children were added, if there are children with status !== "Completed", we set the status of the macro as Active and delete the output note
                let children = await checkChildren(activity.phaseSubphase);
                let allChildrenCompleted = children.every(child => child.status === "Completed" && child.output !== null && child.output !== "");
                if (!allChildrenCompleted) {
                    asyncOperations.push(updateActivityStatus(activity._id, "Active"));
                    //delete the output note of the macroactivity
                    if (activity.output) {
                        asyncOperations.push(deleteNoteById(activity.output._id));
                    }
                }
            }

        } else if (activity.status === "Active" && activity.isMacroactivity) {
            let children = await checkChildren(activity.phaseSubphase);
            if(children.length > 0) {
                let allChildrenCompleted = children.every(child => child.status === "Completed" && child.output !== null && child.output !== "");
                if (allChildrenCompleted) {
                    asyncOperations.push(updateActivityStatus(activity._id, "Completed"));
                }
            }
        }
        // Check the activity deadline and if it is Overdue or Abandoned
        const [isLate, isAbandoned, isAbandonedNoParticipants] = checkOverdueAbandoned(activity);

        if (isLate && !isAbandoned && !isAbandonedNoParticipants) {
            asyncOperations.push(updateActivityStatus(activity._id, "Overdue"));
        }

        if (isAbandoned || isAbandonedNoParticipants) {
            if (activity.status !== "Abandoned") {
                asyncOperations.push(updateActivityStatus(activity._id, "Abandoned"));
            }
        }
        //if members are re-added, and the activity is not overdue since last 7 days, the activity will be Not_Activatable in case of no input, Activatable otherwise, Active if it has output also
        if (activity.sharedWith.length > 0 && activity.status === "Abandoned") {
            if (!isAbandoned) {
                if (!activity.input && activity.status !== "Not_Activatable") {
                    asyncOperations.push(updateActivityStatus(activity._id, "Not_Activatable"));
                } else if (activity.input && !activity.output && activity.status !== "Activatable") {
                    asyncOperations.push(activatableActivity(activity._id, "Activatable"));
                } else if (activity.output && activity.status !== "Active") {
                    asyncOperations.push(updateActivityStatus(activity._id, "Active"));
                }
            }
        }
        //if the activity is reactivated, the output note can be updated and the output field is enabled, we also show the save button and adjust dependencies input
        if (activity.status === "Reactivated" && !activity.isMacroactivity) {
            asyncOperations.push(reactivateActivity(activity._id, "Reactivated"));
        }
    }

    await Promise.all(asyncOperations);
}

// Function to render the activities in handleActivities
async function renderActivities(activities, userLogged, isOwner) {
    let activityContainer = document.getElementById("activity-container");
    let closeBtn = document.getElementById("closeActivityViewBtn");

    let content = `<h2>Project Activities</h2>`;

    if (activities.length === 0) {
        content += `<p>No activities assigned to you.</p>`;
    } else {
        content += `<ul class="list-group">`;

        for (const activity of activities) {
            let star = activity.milestone ? "*" : ""; // milestone
            // Check the status of the input/output fields
            const [ inputDisabled, inputSelectDisabled, inputInsertDisabled, outputDisabled, outputSelectDisabled, outputInsertDisabled ] = getActivityInputOutputStatus(activity, userLogged, isOwner, false);

            let children = [];
            if (activity.isMacroactivity) {
                children = await checkChildren(activity.phaseSubphase);
            }
            // Show the activity
            content += generateContent(children, activity, star, inputDisabled, inputSelectDisabled, inputInsertDisabled, outputDisabled, outputSelectDisabled, outputInsertDisabled, isOwner, userLogged);
        }

        content += `</ul>`;
    }

    // Insert the content in the activity container
    activityContainer.innerHTML = content;
    activityContainer.style.display = "block";
    closeBtn.style.display = "block";

    //Function to disable/enable the buttons depending on the status of the activity
    for (const activity of activities) {
        const isMember = activity.sharedWith.some(member => member.username === userLogged);
        const OwnerNotMember = isOwner && !isMember;
        await updateActivityButtons(activity._id, isOwner, OwnerNotMember);

        //small buttons adjustment for macro without children
        if (activity.isMacroactivity){
            await adjustMacroButtons(activity._id);
        }
    }
}

// Function to generate the content of the activities in handleActivities
function generateContent(children, activity, star, inputDisabled, inputSelectDisabled, inputInsertDisabled, outputDisabled, outputSelectDisabled, outputInsertDisabled, isOwner, userLogged) {
    
    let content = `
    <li class="list-group-item">
        <strong> ${star}${activity.isMacroactivity ? `Macro: ${activity.title}` : activity.title}</strong>
        <p id="status-${activity._id}">Status: ${activity.status}</p>
        <br>
        `;
    
    // Input & Output fields are disabled for macroactivities with children
    if (activity.isMacroactivity && children.length > 0) {
        content += `
            Input type: 
            <select id="input-type-${activity._id}" disabled>
                <option value="text">Text</option>
                <option value="empty">Empty</option>
                <option value="link">Link</option>
            </select>
            <input type="text" id="input-${activity._id}" value="${(activity.input?.content || '')}" disabled> 
            
            <label>Output type:</label>
            <select id="output-type-${activity._id}" disabled>
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="true">Completed</option>
            </select>
            <input type="text" id="output-${activity._id}" value="${(activity.output?.content || '')}" disabled>
            <p id="startDate-${activity._id}">Start Date: ${new Date(activity.startDate).toLocaleDateString()}<p>
            <p id="deadline-${activity._id}">Deadline: ${new Date(activity.deadline).toLocaleDateString()}<p>
        `;
    } else {
        // Normal activities logic here
        content += `
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
    return content;
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

// Function to validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
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

// Function to update the buttons of an activity depending on its status
async function updateActivityButtons(activityId, isOwner, ownerNotMember) {
    try{

        //get the activity
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`);
        const activityData = await response.json();
        if (!activityData.success) {
            throw new Error('Failed to fetch activity data');
        }
        const activity = activityData.activity;

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
                }else{
                    //check if output field is enabled, we will not activate the start button in that case
                    let outputField = document.getElementById(`output-${activityId}`);
                    if(outputField && !outputField.disabled){
                    toggleElements([startBtn], true);
                    }
                }
                break;
        }
    }catch(error){
        console.error("Error updating activity buttons:", error);
    }
}

// Function to adjust macroactivity buttons in case it has no children
async function adjustMacroButtons(macroId) {
    try{
        //get the macroactivity
        const response = await fetch(`http://localhost:8000/api/activity/${macroId}`);
        const activityData = await response.json();
        if (!activityData.success) {
            throw new Error('Failed to fetch activity data');
        }
        const activity = activityData.activity;
        if(activity.status === "Reactivated") {
            //check if the macroactivity has children, if not, we should activate the output field and be able to edit the output note
            let children = await checkChildren(activity.phaseSubphase);
            if(children.length === 0) {
                // Reactivates the buttons and fields
                toggleElements([
                    `abandon-${activity._id}`,
                    `save-output-${activity._id}`,
                    `output-type-${activity._id}`,
                    `output-${activity._id}`
                ], false);

                // Show the "Save updated output" button
                let saveOutputButton = document.getElementById(`save-output-${activity._id}`);
                if (saveOutputButton) {
                    saveOutputButton.style.display = "inline-block";
                }

                // Disables the reject button
                toggleElements([`reactivate-${activity._id}`], true);

                // Hides the two buttons for the owner to decide if present
                let container = document.getElementById(`activity-${activity._id}-buttons-container`);
                if (container) {
                    container.innerHTML = "";
                }
            }
        }
    }
    catch(error){
        console.error("Error adjusting macro buttons:", error);
    }
}
    

//Function to check if the macroActivity has direct and indirect children (indirect if this is a macro of a phase that has subphases)
async function checkChildren(phaseSubphase) {
    try{
        //get the phaseSubphase of the activity
        const response = await fetch(`http://localhost:8000/api/phaseSubphase/${phaseSubphase}`);
        const phaseSubphaseres = await response.json();
        if (!phaseSubphaseres.success) {
            throw new Error('Failed to fetch phaseSubphase data');
        }
        const phaseSubphaseData = phaseSubphaseres.phaseSubphase;
        
        //get the activities of the phaseSubphase, they are the children of the macroactivity
        const children = phaseSubphaseData.activities;

        //if the phaseSubphase is a phase, we need to get the activities of the subphases too
        if (phaseSubphaseData.type === 'phase') {
            //we get the subphases of the phase
            for(const subphaseId of phaseSubphaseData.subphases) {
                //get the subphase
                const response2 = await fetch(`http://localhost:8000/api/phaseSubphase/${subphaseId}`);
                const subphaseres = await response2.json();
                if (!subphaseres.success) {
                    throw new Error('Failed to fetch subphase data');
                }
                const subphaseData = subphaseres.phaseSubphase;
                //get the activities of the subphase
                children.push(...subphaseData.activities);
            }
        }
        return children;
    }catch(error){
        console.error("Error fetching phaseSubphase:", error);
    }
}

//called in checkAndUpdateMacroStatus, phase case
async function handlePhaseMacro(macroActivity, phaseSubphase, type) {
    if (type === "output") {  //needs the check of the children
        //check if the activities of the phasesubphase + children are all with status = Completed
        //get all direct and indirect children of the macroactivity (indirect if this is a macro of a phase that has subphases)
        const allChildren = await checkChildren(phaseSubphase._id);
        const allCompleted = allChildren.every(act => act.status === "Completed" && act.output !== null && act.output !== "");
        
        if (allCompleted) {
            //insert the output in the macroactivity output field
            let outputField = document.getElementById(`output-${macroActivity._id}`);
            if (outputField) {
                outputField.value = "Completed";
            }
            // Update the status of the macroactivity to Completed
            await updateActivityStatus(macroActivity._id, "Completed");
            //insert the macroactivity output in the backend
            await insertMacroInputOutput(macroActivity._id, 'output', "Completed");
        }
    }else if(type === "input"){
        //at least one activity has input, so we change the macroactivity input and call the put request to update the macroactivity input
        let inputField = document.getElementById(`input-${macroActivity._id}`);
        if (inputField) {
            inputField.value = "Empty";
        }
        await updateActivityStatus(macroActivity._id, "Active");
        //insert the macroactivity input in the backend
        await insertMacroInputOutput(macroActivity._id, 'input', "Empty");
    }else if(type === "reactivate"){
        //check if the macro was Completed, if so we set the status as Reactivated
        if(macroActivity.status === "Completed"){
            await updateActivityStatus(macroActivity._id, "Reactivated");
            //we clear the output field in the DOM
                let outputField = document.getElementById(`output-${macroActivity._id}`);
            if (outputField.value !== "") {
                outputField.value = "";
            }
        }
    }
}

//called in checkAndUpdateMacroStatus, subphase case
async function handleSubphaseMacro(macroActivity, phaseSubphase, parentPhase, type) {
    //collect the children of both subphase and parent phase
    const subChildren = await checkChildren(phaseSubphase._id);
    let parentChildren = [];
    if (parentPhase) {
        parentChildren = await checkChildren(parentPhase._id);
    }

    if (type === "input") {
        // we set the input for the macroactivity of the subphase
        let inputField = document.getElementById(`input-${macroActivity._id}`);
        if (inputField) inputField.value = "Empty";
        await updateActivityStatus(macroActivity._id, "Active");
        await insertMacroInputOutput(macroActivity._id, 'input', "Empty");

        // we set the input for the macroactivity of the parent phase
        if (parentPhase && parentPhase.macroActivity) {
            let parentInputField = document.getElementById(`input-${parentPhase.macroActivity._id}`);
            if (parentInputField) parentInputField.value = "Empty";
            await updateActivityStatus(parentPhase.macroActivity._id, "Active");
            await insertMacroInputOutput(parentPhase.macroActivity._id, 'input', "Empty");
        }
    } else if (type === "output") {
        //if EVERY activity of the subphase is completed and has output, we set the status of the macro as Completed
        const subAllCompleted = subChildren.length > 0 && subChildren.every(act => act.status === "Completed" && act.output && act.output !== "");
        if (subAllCompleted) {
            let outputField = document.getElementById(`output-${macroActivity._id}`);
            if (outputField) outputField.value = "Completed";
            await updateActivityStatus(macroActivity._id, "Completed");
            await insertMacroInputOutput(macroActivity._id, 'output', "Completed");
        }
        //for the parent phase, update the macro only if ALL its activities (direct and all subphases) are completed
        if (parentPhase && parentPhase.macroActivity) {
            const parentAllCompleted = parentChildren.length > 0 && parentChildren.every(act => act.status === "Completed" && act.output && act.output !== "");
            if (parentAllCompleted) {
                let parentOutputField = document.getElementById(`output-${parentPhase.macroActivity._id}`);
                if (parentOutputField) parentOutputField.value = "Completed";
                await updateActivityStatus(parentPhase.macroActivity._id, "Completed");
                await insertMacroInputOutput(parentPhase.macroActivity._id, 'output', "Completed");
            }
        }
    } else if (type === "reactivate") {
        // we set the status as Reactivated for the macroactivity of the subphase
        if (macroActivity.status === "Completed") {
            await updateActivityStatus(macroActivity._id, "Reactivated");
            // we clear the output field in the DOM
            let outputField = document.getElementById(`output-${macroActivity._id}`);
            if (outputField && outputField.value !== "") {
                outputField.value = "";
            }
        }
        // and for the macroactivity of the parent phase
        if (parentPhase && parentPhase.macroActivity && parentPhase.macroActivity.status === "Completed") {
            await updateActivityStatus(parentPhase.macroActivity._id, "Reactivated");
            // we clear the output field in the DOM
            let parentOutputField = document.getElementById(`output-${parentPhase.macroActivity._id}`);
            if (parentOutputField && parentOutputField.value !== "") {
                parentOutputField.value = "";
            }
        }
    }
}

// Function to check if the activity is overdue or abandoned in handleActivities
function checkOverdueAbandoned(activity) {
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
    return [ isLate, isAbandoned, isAbandonedNoParticipants ];
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
            let activityData = await response.json();
            if (!activityData.success) {
                throw new Error('Failed to fetch activity data');
            }
            let activity = activityData.activity;
            
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

//Function to update the deadline of the macros in the DOM
function updateMacroDeadlinesInDOM(updatedMacros) {
    updatedMacros.forEach(([macroId, newDeadlineStr]) => {
        const newDeadline = new Date(newDeadlineStr);

        const deadlineElement = document.getElementById(`deadline-${macroId}`);
        if (deadlineElement) {
            deadlineElement.innerText = `Deadline: ${newDeadline.toLocaleDateString()}`;
        }
    });
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