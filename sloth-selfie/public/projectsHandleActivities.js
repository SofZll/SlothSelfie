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
                content += `
                    <li class="list-group-item">
                        <strong>${star}${activity.title}</strong> - Status: ${activity.status}
                        <br>Input: <input type="text" id="input-${activity._id}" value="${activity.input || ''}">
                        <br>
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