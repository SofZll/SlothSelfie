import React, { useContext } from 'react';

import { TimeMachineContext } from '../contexts/TimeMachineContext';
import TimeMachinePopup from './TimeMachinePopup';
import { StyleContext } from './StyleContext';

const TimeMachineButton = () => {
    const { color } = useContext(StyleContext);

    const { machineOpen, setMachineOpen, currentTime, currentDate } = useContext(TimeMachineContext);

    return (
        <>
            <div className='time-machine'>
                <button className='time-machine-button' onClick={() => setMachineOpen(prevState => !prevState)}>
                    <p className='time' style={{ color }}>{currentTime}</p>
                    <p className='date' style={{ color }}>{currentDate}</p>
                </button>
            </div>
            {machineOpen && <TimeMachinePopup />}
        </>
    );
};

export default TimeMachineButton;