import React, { createContext, useState, useEffect } from 'react';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    const [username, setUsername] = useState('');
    
    //Define the activity data structure
    const [activityData, setActivityData] = useState({
        title: "",
        deadline: "",
        completed: false,
        userId: '', // User ID of whom creates the event
        type: 'activity',
    });

    // Get the username of the authenticated user
    useEffect(() => {
        const fetchUsername = async () => {
          try {
            const response = await fetch('http://localhost:8000/api/user/username', {
            credentials: 'include'
            });const data = await response.json();
            console.log('Username:', data.username);
            setUsername(data.username);
        } catch (error) {
            console.error('Error fetching username:', error);
        }
        };
    
        fetchUsername();
    }, []); 
           
    return (
        <ActivityContext.Provider value={{ activities, setActivities, activityData, setActivityData, username }}>
            {children}
        </ActivityContext.Provider>
    );
};
