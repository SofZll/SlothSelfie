import React, { useState, useEffect, createContext } from 'react';
import '../styles/TimeMachine.css';

import { dateFromDate, timeFromDate } from '../utils/utils';

const TimeMachineContext = createContext();

const TimeMachineProvider = ({ children }) => {
    const [virtualNow, setVirtualNow] = useState(new Date());
    const [machineOpen, setMachineOpen] = useState(false);
    const currentDate = dateFromDate(virtualNow);
    const currentTime = timeFromDate(virtualNow);
    
    return (
        <TimeMachineContext.Provider value={{ machineOpen, setMachineOpen, virtualNow, setVirtualNow, currentTime, currentDate }}>
            {children}
        </TimeMachineContext.Provider>
    );
};

export { TimeMachineContext, TimeMachineProvider };