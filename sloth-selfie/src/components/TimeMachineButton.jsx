import React, { useState, useEffect, useCallback } from 'react';
import '../styles/TimeMachine.css';
import { Clock10 } from 'lucide-react';

import TimeMachinePopup from './TimeMachinePopup';

const TimeMachineButton = () => {
    const [machineOpen, setMachineOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    /* TODO: da cambiare con la chiamata in back */
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
        <>
            <div className='time-machine'>
                <button className='time-machine-button' onClick={() => setMachineOpen(true)}>
                    <p className='time'>{currentTime}</p>
                    <p className='date'>{currentDate}</p>
                </button>
            </div>
            {machineOpen && <TimeMachinePopup setMachineOpen={setMachineOpen} setCurrentTime={setCurrentTime} currentTime={currentTime} setCurrentDate={setCurrentDate} currentDate={currentDate} />}
        </>
    );
};

export default TimeMachineButton;