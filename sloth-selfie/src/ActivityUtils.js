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
            id: activity.id,
            title: activity.title,
            start: new Date(),
            end: new Date(),
                deadline: new Date(),
                completed: activity.completed,
                type: 'activity'
        };
    }
      
        return {
            id: activity.id,
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
            id: activities.length + 1,
            title: title,
            deadline: deadline,
            completed: false,
            userId: username, // Here we should use the authenticated user
        };
        
        try {
            if (!username) {
                console.error("Username non definito");
            }
            //const response = await fetch('/api/activities', {
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

    // Get the saved note from the backend
    const savedActivity = await response.json();

    console.log("Attività salvata dal backend:", savedActivity);


        setActivities([...activities, newActivity]);
        console.log("Current activities:", [...activities, newActivity]);

        // Reset input fields
        handleActivityDataChange('title', '', setActivityData);
        handleActivityDataChange('deadline', '', setActivityData);
    } catch (error) {console.error('Error while adding activity:', error);
    }
}

// Handle removing an activity and marking it as completed while pressing btn "Done"
export function handleRemoveActivity(id, activities, setActivities) {
    const updatedActivities = activities.map(activity => {
        if (activity.id === id) {
            return { ...activity, completed: true };
        }
        return activity;
    });

    setActivities(updatedActivities);
    console.log("Current activities:", updatedActivities);
}


// Update overdue activities
export function updateOverdueActivities(activities, setActivities) {
    const today = new Date().toISOString().split('T')[0];

    const updatedActivities = activities.map(activity => {
        const activityDate = new Date(activity.deadline).toISOString().split('T')[0];
        // if the activity is not completed and the deadline is in the past
        if (activityDate < today && !activity.completed) {
            return {
                ...activity,
                deadline: today,
            };
        }
        return activity;
    });

    // update the state only if there are changes
    const hasChanges = updatedActivities.some((activity, index) => activity.deadline !== activities[index].deadline);

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

// Handle updating an activity
export function handleUpdateActivity(e, activityData, setActivityData, activities, setActivities, setSelectedActivity) {
    e.preventDefault();
    const updatedActivities = activities.map(activity => {
        if (activity.id === activityData.id) {
            return {
                ...activity,
                title: activityData.title,
                deadline: activityData.deadline,
                completed: activityData.completed
            };
        }
        return activity;
    });
    
    setActivities(updatedActivities);
    handleClosePopupA(setSelectedActivity, setActivityData);
}

//Handle deleting an activity
export function handleDeleteActivity(id, activities, setActivities, setSelectedActivity) {
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
    setSelectedActivity(null); // close the pop-up
}

  // Function to Abort the deletion
  export function handleAbortDelete(setShowConfirmation) {
    setShowConfirmation(false);
  };

  // Function to confirm the deletion
  export function handleConfirmDelete(selectedActivity, setShowConfirmation, handleDeleteActivity, activities, setActivities, setSelectedActivity, setActivityData) {
    handleDeleteActivity(selectedActivity.id, activities, setActivities, setSelectedActivity);
    setShowConfirmation(false);
    handleClosePopupA(setSelectedActivity, setActivityData);
  };
