import React, { useState, useEffect, createContext, useRef } from 'react';
import '../styles/TimeMachine.css';

import { dateFromDate, timeFromDate } from '../utils/utils';
import { apiService } from '../services/apiService';

const TimeMachineContext = createContext();

const TimeMachineProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [machineOpen, setMachineOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);
    const virtualNowRef = useRef(new Date());

    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

    // TODO: mettere resettime e seetime qui
    useEffect(() => {
        const loadTimeState = async () => {
            try {
                const response = await apiService('/time/state', 'GET');

                if (response.success) {
                    setIsActive(response.state);
                    virtualNowRef.current = new Date(response.virtualNow);
                    localStorage.setItem('timeMachineState', JSON.stringify({
                        isActive: response.state,
                        virtualNow: new Date(response.virtualNow)
                    }));            
                } else {
                    const savedState = localStorage.getItem('timeMachineState');
                    if (savedState) {
                        const { isActive, virtualNow } = JSON.parse(savedState);
                        setIsActive(isActive);
                        virtualNowRef.current = new Date(virtualNow);
                    }
                }
            } catch (error) {
                console.error('Error loading time machine state:', error);
                const savedState = localStorage.getItem('timeMachineState');
                if (savedState) {
                    const { isActive, virtualNow } = JSON.parse(savedState);
                    setIsActive(isActive);
                    virtualNowRef.current = new Date(virtualNow);
                }
            }
        }

        loadTimeState();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            virtualNowRef.current = new Date(virtualNowRef.current.getTime() + 1000);
            setCurrentDate(dateFromDate(virtualNowRef.current));
            setCurrentTime(timeFromDate(virtualNowRef.current));
        }, 1000);
    
        return () => clearInterval(interval);
    }, []);

    const getVirtualNow = () => new Date(virtualNowRef.current);
    
    const setVirtualNow = (newDate) => {
        virtualNowRef.current = new Date(newDate);
        triggerRefresh();
    }

    return (
        <TimeMachineContext.Provider value={{ 
            machineOpen, 
            setMachineOpen, 
            getVirtualNow, 
            setVirtualNow, 
            isActive, 
            setIsActive, 
            currentDate,
            currentTime,
            refreshKey, 
            triggerRefresh 
        }}>
            {children}
        </TimeMachineContext.Provider>
    );
};

export { TimeMachineContext, TimeMachineProvider };