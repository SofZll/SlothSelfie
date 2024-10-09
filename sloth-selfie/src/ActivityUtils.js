// Convert activities to the format required by React Big Calendar
export function normalizeActivities (activities) {
    return activities.map((activity) => {
            let startDate, endDate;
        
            startDate = new Date(activity.deadline);
            endDate = new Date(activity.deadline);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`Invalid date for event: ${JSON.stringify(activity)}`);
        return {
         title: activity.title,
        start: new Date(),
        end: new Date(),
        };
    }
      
        return {
        title: activity.title,
        start: startDate,
        end: endDate,
        };
    });
};

export function handleRemoveActivity (id, activities, setActivities) {
    if (!activities) return;
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
    console.log("Current activities:", updatedActivities);
};