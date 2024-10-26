import React, { createContext, useState } from 'react';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);

    return (
        <ActivityContext.Provider value={{ activities, setActivities }}>
            {children}
        </ActivityContext.Provider>
    );
};
