import React, { createContext, useState } from 'react';

export const CustomizationContext = createContext();

export const CustomizationProvider = ({ children }) => {
    const [customizations, setCustomizations] = useState(() => {
        // we check if there are saved customizations in local storage
        const savedCustomizations = localStorage.getItem('customizations');
        return savedCustomizations ? JSON.parse(savedCustomizations) : {
            calendar: 'showCalendar', // default values
            notes: 'listOfNotes',
            pomodoro: 'listOfPomodoros',
            projects: 'listOfProjects',
        };
    });

    return (
        <CustomizationContext.Provider value={{ customizations, setCustomizations }}>
            {children}
        </CustomizationContext.Provider>
    );
};
