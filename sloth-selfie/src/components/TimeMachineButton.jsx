import React, { useContext } from 'react';
import { TimeMachineContext } from '../contexts/TimeMachineContext';

import TimeMachinePopup from './TimeMachinePopup';

const TimeMachineButton = () => {
    const { machineOpen, setMachineOpen, currentTime, setCurrentTime, currentDate, setCurrentDate } = useContext(TimeMachineContext);

    return (
        <>
            <div className='time-machine'>
                <button className='time-machine-button' onClick={() => setMachineOpen(true)}>
                    <p className='time'>{currentTime}</p>
                    <p className='date'>{currentDate}</p>
                </button>
            </div>
            {machineOpen && <TimeMachinePopup />}
        </>
    );
};

export default TimeMachineButton;