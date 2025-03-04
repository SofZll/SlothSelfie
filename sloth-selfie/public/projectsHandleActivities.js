//function to handle activities status by the members of each activity or by the owner
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
        
        // Generate the modal content
        let modalContent = `<h2>Project Activities</h2>`;
        if (activities.length === 0) {
            modalContent += `<p>No activities assigned to you.</p>`;
        } else {
            modalContent += `<ul>`;
            activities.forEach(activity => {

                if(activity.milestone === true){ //if it is a milestone we add a star to the title
                    modalContent += `<li><strong>*${activity.title}</strong> - Status: ${activity.status}
                    <br>Input: <input type="text" id="input-${activity._id}" value="${activity.input || ''}">
                        <br>
                        <button onclick="updateActivityStatus('${activity._id}', 'started')">Start</button>
                        <button onclick="updateActivityStatus('${activity._id}', 'completed')">Complete</button>
                        <button onclick="updateActivityStatus('${activity._id}', 'abandoned')">Abandon</button>
                    </li>
                `;
                }
                else{
                    modalContent += `<li><strong>${activity.title}</strong> - Status: ${activity.status}
                    <br>Input: <input type="text" id="input-${activity._id}" value="${activity.input || ''}">
                        <br>
                        <button onclick="updateActivityStatus('${activity._id}', 'started')">Start</button>
                        <button onclick="updateActivityStatus('${activity._id}', 'completed')">Complete</button>
                        <button onclick="updateActivityStatus('${activity._id}', 'abandoned')">Abandon</button>
                    </li>
                `;
                }
            });
            modalContent += `</ul>`;
        }

        // Show modal
        showModal(modalContent);

    } catch (error) {
        console.error("Error handling activities of the project:", error);
    }
}

// Function to show modal
function showModal(content) {
    let modal = document.getElementById("activityModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "activityModal";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.padding = "20px";
        modal.style.backgroundColor = "#fff";
        modal.style.border = "1px solid black";
        modal.innerHTML = `<div id="modalContent"></div><button onclick="closeModal()">Close</button>`;
        document.body.appendChild(modal);
    }
    document.getElementById("modalContent").innerHTML = content;
    modal.style.display = "block";
}

// Function to close modal
function closeModal() {
    document.getElementById("activityModal").style.display = "none";
}

// Function to update activity status   //TODO
async function updateActivityStatus(activityId, status) {
    try {
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert("Activity status updated!");
            closeModal(); // Close modal after update
        } else {
            alert("Error updating activity status.");
        }
    } catch (error) {
        console.error("Error updating activity:", error);
    }
}