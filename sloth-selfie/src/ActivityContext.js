import React, { createContext, useState, useEffect, useContext } from 'react';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    const [currUsername, setCurrUsername] = useState('');

    // Get the username of the authenticated user
    useEffect(() => {
        const fetchUsername = async () => {
          try {
            const response = await fetch('http://localhost:8000/api/user/username', {
            credentials: 'include'
            });const data = await response.json();
            console.log('Username:', data.currUsername);
            setCurrUsername(data.currUsername);
        } catch (error) {
            console.error('Error fetching username:', error);
        }
        };
    
        fetchUsername();
    }, []); 
           
    return (
        <ActivityContext.Provider value={{ activities, setActivities, currUsername }}>
            {children}
        </ActivityContext.Provider>
    );
};
