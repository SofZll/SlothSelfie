import React, { useState, useEffect, createContext, useContext } from 'react';
import '../styles/TimeMachine.css';

const TimeMachineContext = createContext();

const TimeMachineProvider = ({ children }) => {
    const [machineOpen, setMachineOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    const setTime = () => {
            const now = new Date();
            const time = now.toTimeString().split(' ')[0].slice(0, 5);
    
            const formattedDate = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(',', '').replace(/\b[a-z]/g, char => char.toUpperCase());
            
            setCurrentDate(formattedDate);
            setCurrentTime(time);
        }
    
        useEffect(() => {
            setTime();
        }, []);
    
    return (
        <TimeMachineContext.Provider value={{ machineOpen, setMachineOpen, currentTime, setCurrentTime, currentDate, setCurrentDate }}>
            {children}
        </TimeMachineContext.Provider>
    );
};

export { TimeMachineContext, TimeMachineProvider };