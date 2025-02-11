import React, { createContext, useState, useEffect } from 'react';

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
        customValue: '',
        notificationRepeat: '0',
        notificationType:{
            email: false,
            OS: false,
            SMS: false,
        },
        sharedWith: [],
    });

    useEffect(() => {
        console.log("Stato aggiornato delle activities:", activities); //problemi
    }, [activities]); 

    return (
        <ActivityContext.Provider value={{ activities, setActivities, activityData, setActivityData}}>
            {children}
        </ActivityContext.Provider>
    );
};
