// Convert activities to the format required by React Big Calendar
export function normalizeActivities (activities) {
    return activities.filter(activity => !activity.completed).map((activity) => {
            let startDate, endDate;
        
            startDate = new Date(activity.deadline);
            endDate = new Date(activity.deadline);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`Invalid date for event: ${JSON.stringify(activity)}`);
        return {
         title: activity.title,
        start: new Date(),
        end: new Date(),
        deadline: activity.deadline,
        };
    }
      
        return {
        title: activity.title,
        start: startDate,
        end: endDate,
        deadline: activity.deadline,
        };
    });
};

// Handle removing an activity and marking it as completed
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

export function handleEditActivity(id) {
    return;
}

export function handleDeleteActivity(id) {
    return;
}

{/* 
// Handle editing an activity
export function handleEditActivity(id) {
    // Logica per modificare l'attività
    const activityToEdit = activity.find(activity => activity.id === id);
    if (activityToEdit) {
      // Popola il form con i dati dell'attività per modificarla
    }
  }

// Handle deleting an activity
export function handleDeleteActivity(id) {
  const updatedActivities = activity.filter(activity => activity.id !== id);
  setActivities(updatedActivities);
  setSelectedActivity(null); // Chiudi il pop-up
}
*/}