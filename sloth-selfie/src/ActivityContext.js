import React, { createContext, useState } from 'react';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    
    //Define the activity data structure
    const [activityData, setActivityData] = useState({
        title: "",
        deadline: "",
        completed: false,
        userId: '', // User ID of whom creates the event
        type: 'activity',
        notify: false,
        notificationTime: '0',
        sharedWith: [],
    });

    return (
        <ActivityContext.Provider value={{ activities, setActivities, activityData, setActivityData}}>
            {children}
        </ActivityContext.Provider>
    );
};
