import React, { createContext, useState, useEffect } from 'react';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    const [username, setUsername] = useState('');

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
        <ActivityContext.Provider value={{ activities, setActivities, username }}>
            {children}
        </ActivityContext.Provider>
    );
};
