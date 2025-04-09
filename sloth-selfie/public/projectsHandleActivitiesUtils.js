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
            <input type="text" id="input-${activity._id}" value="${(activity.status === 'Not_Activatable' || activity.status === 'Activatable') ? '' :(activity.input?.content || '')}" disabled> 

            
            <label>Output type:</label>
            <select id="output-type-${activity._id}" disabled>
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="true">Completed</option>
            </select>
            <input type="text" id="output-${activity._id}" value="${(activity.status === 'Reactivated' || activity.status === 'Activatable'|| activity.status === 'Active' || activity.status === 'Not_Activatable') ? '' : (activity.output?.content || '')}" disabled>
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

//Function to check if the macroActivity has direct and indirect children (indirect if this is a macro of a phase that has subphases)
async function checkChildren(phaseSubphase) {
    try{
        //get the phaseSubphase of the activity
        const response = await fetch(`http://localhost:8000/api/phaseSubphase/${phaseSubphase}`);
        const phaseSubphaseData = await response.json();
        
        //get the activities of the phaseSubphase, they are the children of the macroactivity
        const children = phaseSubphaseData.activities;

        //if the phaseSubphase is a phase, we need to get the activities of the subphases too
        if (phaseSubphaseData.type === 'phase') {
            //we get the subphases of the phase
            for(const subphaseId of phaseSubphaseData.subphases) {
                //get the subphase
                const response = await fetch(`http://localhost:8000/api/phaseSubphase/${subphaseId}`);
                const subphaseData = await response.json();
                //get the activities of the subphase
                children.push(...subphaseData.activities);
            }
        }
        console.log("Children of the macroactivity:", children);
        return children;
    }catch(error){
        console.error("Error fetching phaseSubphase:", error);
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