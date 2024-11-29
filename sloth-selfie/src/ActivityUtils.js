 // Function to handle changes in activity data
export function handleActivityDataChange (field, value, setActivityData) {
    setActivityData((prevEventData) => ({
        ...prevEventData,
        [field]: value
    }));
    };

// Convert activities to the format required by React Big Calendar
export function normalizeActivities (activities) {
    return activities.filter(activity => !activity.completed).map((activity) => {
            let startDate, endDate;
        
            startDate = new Date(activity.deadline);
            endDate = new Date(activity.deadline);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`Invalid date for event: ${JSON.stringify(activity)}`);
        return {
            _id: activity._id,
            title: activity.title,
            start: new Date(),
            end: new Date(),
            deadline: new Date(),
            completed: activity.completed,
            type: 'activity'
        };
    }
      
        return {
            _id: activity._id,
            title: activity.title,
            start: startDate,
            end: endDate,
            deadline: activity.deadline,
            completed: activity.completed,
            type: 'activity'
        };
    });
};

// Handle adding an activity

export async function handleAddActivity(e, activityData, setActivityData, activities, setActivities, username) {
    if (e && e.preventDefault) {
        e.preventDefault();
      }
      console.log("Adding activity:", activityData);
      const {title, deadline} = activityData;
        let newActivity = {
            title: title,
            deadline: deadline,
            completed: false,
            userId: username, // Here we should use the authenticated user
        };
        
        try {
            if (!username) {
                console.error("Username non definito");
            }
            //const response = await fetch('/api/activity', {
            //locale:
            const response = await fetch('http://localhost:8000/api/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newActivity)   
        });

    if (!response.ok) {
        throw new Error('Errore nella creazione della attività');
    }

    // Get the saved activity from the backend
    const savedActivity = await response.json();

    console.log("Attività salvata dal backend:", savedActivity);


        setActivities([...activities, savedActivity]);
        console.log("Current activities:", [...activities, newActivity]);

        // Reset input fields
        handleActivityDataChange('title', '', setActivityData);
        handleActivityDataChange('deadline', '', setActivityData);
    } catch (error) {console.error('Error while adding activity:', error);
    }
}

// Handle removing an activity and marking it as completed while pressing btn "Done" ->err 500 se non ricarico la pagina a mano
export async function handleRemoveActivity(activityId, activities, setActivities) {
    if (!activityId) {
        console.error("ID dell'attività non trovato");
    }

    try{
        //const response = await fetch(`/api/activities/${activityId}`, {
        //locale:
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Errore nella cancellazione Done della attività');
        }

        // Update the frontend
        const updatedActivities = activities.map(activity => {
            if (activity._id === activityId) {
                return { ...activity, completed: true };
            }
            return activity;
        });

        setActivities(updatedActivities);
        console.log("Current activities:", updatedActivities);
}catch (error) {
    console.error('Error while removing activity:', error);
}
}

// Update overdue activities ->err 500 se non ricarico la pagina a mano
export async function updateOverdueActivities(activities, setActivities) {
    const today = new Date().toISOString().split('T')[0];

    // Maps the activities array to identify overdue activities
    const updatedActivities = await Promise.all(
        activities.map(async (activity) => {
            const activityDate = new Date(activity.deadline).toISOString().split('T')[0];
            
            // if the activity is not completed and the deadline is in the past
            if (activityDate < today && !activity.completed) {
                try {
                    // we update the activity deadline with the current date
                    const response = await fetch(`/api/activity/${activity._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...activity, deadline: today }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update activity: ${response.statusText}`);
                    }

                    const updatedActivity = await response.json();
                    return updatedActivity;
                } catch (error) {
                    console.error(`Error updating overdue activity: ${activity.title}`, error);
                    return activity; // return the original activity in case of error
                }
            }

            return activity;
        })
    );

    // if there are changes, update the frontend
    const hasChanges = updatedActivities.some(
        (activity, index) => activity.deadline !== activities[index].deadline
    );

    if (hasChanges) {
        setActivities(updatedActivities);
    }
}

//Function to reset imput fields
export function handleClosePopupA(setSelectedActivity, setActivityData) {
    setSelectedActivity(null); // Close the popup
    // Reset input fields
    handleActivityDataChange('id', '', setActivityData);
    handleActivityDataChange('title', '', setActivityData);
    handleActivityDataChange('deadline', '', setActivityData);
    handleActivityDataChange('completed', false, setActivityData);
}

// Handle updating an activity ->err 500 se non ricarico la pagina a mano
export async function handleUpdateActivity(e, activityData, setActivityData, activities, setActivities, setSelectedActivity) {
    e.preventDefault();
    try {
        // sends data to db
        const response = await fetch(`http://localhost:8000/api/activity/${activityData._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: activityData.title,
                deadline: activityData.deadline,
                completed: activityData.completed,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update activity: ${response.statusText}`);
        }

        const updatedActivity = await response.json();

        // update the frontend
        const updatedActivities = activities.map((activity) =>
            activity._id === activityData.id ? updatedActivity : activity
        );

        setActivities(updatedActivities);
        handleClosePopupA(setSelectedActivity, setActivityData);

        console.log('Activity updated successfully:', updatedActivity);
    } catch (error) {
        console.error('Error updating activity:', error);
        alert('Failed to update the activity. Please try again.');
    }
}

//Handle deleting an activity ->err 500 se non ricarico la pagina a mano
export async function handleDeleteActivity(activityId, activities, setActivities, setSelectedActivity) {
    try{
        //const response = await fetch(`/api/activities/${id}`, {
        //locale:
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Errore nella cancellazione della attività');
        }

        // Update the frontend
        const updatedActivities = activities.filter(activity => activity._id !== activityId);
        setActivities(updatedActivities);
        setSelectedActivity(null); // close the pop-up
    }
    catch (error) {
        console.error('Error while deleting activity:', error);
    }
}

  // Function to Abort the deletion
  export function handleAbortDelete(setShowConfirmation) {
    setShowConfirmation(false);
  };

  // Function to confirm the deletion
  export function handleConfirmDelete(selectedActivity, setShowConfirmation, handleDeleteActivity, activities, setActivities, setSelectedActivity, setActivityData) {
    handleDeleteActivity(selectedActivity._id, activities, setActivities, setSelectedActivity);
    setShowConfirmation(false);
    handleClosePopupA(setSelectedActivity, setActivityData);
  };
