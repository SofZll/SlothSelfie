import React, { createContext, useContext, useState }  from 'react';

const AvailabilityContext = createContext();

export const AvailabilityProvider = ({ children }) => {

    const [availability, setAvailability] = useState({
        startDate: new Date(),
        endDate: new Date(),
        startTime: '',
        days: true,
        duration: 0,
        repeatFrequency: 'none',
    });

    const [availabilities, setAvailabilities] = useState([]);

    const resetAvailability = () => {
        setAvailability({
            startDate: new Date(),
            endDate: new Date(),
            startTime: '',
            days: true,
            duration: 0,
            repeatFrequency: 'none',
        });
    }

    return (
        <AvailabilityContext.Provider value={{ availability, setAvailability, availabilities, setAvailabilities, resetAvailability }}>
            {children}
        </AvailabilityContext.Provider>
    )
}

export const useAvailability = () => useContext(AvailabilityContext);