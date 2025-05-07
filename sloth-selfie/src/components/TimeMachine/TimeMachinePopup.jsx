import React, { useState, useContext } from 'react';

import { NewSwal } from '../../utils/swalUtils';
import { apiService } from '../../services/apiService';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';
import ClockAnimation from './ClockAnimation';

// TODO: il resto delle funzioni

const TimeMachinePopup = () => {
    const { setMachineOpen, getVirtualNow, setVirtualNow, getCurrentTime, getCurrentDate, triggerRefresh } = useContext(TimeMachineContext);

    const currentTime = getCurrentTime();
    const currentDate = getCurrentDate();
    const virtualNow = getVirtualNow();
    const [inputTime, setInputTime] = useState('');
    const [inputDate, setInputDate] = useState('');
    const [animationDirection, setAnimationDirection] = useState('');

    const handleSetTime = async (e) => {
        e.preventDefault();
        if (!inputDate || !inputTime) {
            NewSwal.fire({ icon: 'error', title: 'Oops...', text: 'Please enter a date and time' });
            return;
        }

        const response = await apiService('/time/set', 'POST', { date: inputDate, time: inputTime });
        if (response.success) {
            const dateTime = new Date(`${inputDate}T${inputTime}`);
            if (dateTime < virtualNow) setAnimationDirection('backward');
            else setAnimationDirection('forward');
            
            setTimeout(() => {
                setAnimationDirection(null);
                setMachineOpen(false);
                triggerRefresh();
                if (window.location.pathname === '/projects') {
                    window.location.reload();
                }
            }, 1500);

            setVirtualNow(dateTime);
        } else NewSwal.fire({ icon: 'error', title: 'Oops...', text: 'Error setting time' });
    }

    const handleResetTime = async () => {
        const response = await apiService('/time/reset', 'POST');
        if (response.success) {
            if (virtualNow < new Date()) setAnimationDirection('forward');
            else setAnimationDirection('backward');
            
            setTimeout(() => {
                setAnimationDirection(null);
                setMachineOpen(false);
                triggerRefresh();
                if (window.location.pathname === '/projects') {
                    window.location.reload();
                }
            }, 1500);
            
            setVirtualNow(new Date());
            setInputDate('');
            setInputTime('');
        } else NewSwal.fire({ icon: 'error', title: 'Oops...', text: 'Error resetting time' });
    }

    return (
        <>
            {animationDirection && <ClockAnimation animationDirection={animationDirection} />}
            <div className='modal fade show time-machine-popup'>
                <div className='modal-dialog modal-dialog-centered custom-modal'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Time Machine</h5>
                            <button type='button' aria-label='close' title='Close' className='close' onClick={() => setMachineOpen(false)}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body col-12'>
                            <p>Right now the time is set on:</p>
                            <div className='d-flex justify-content-center gap-3 mb-3'>
                                <span>Date: {currentDate}</span>
                                <span>Time: {currentTime}</span>
                            </div>
                            <div className='d-flex justify-content-center mb-3'>
                                <div className='row'>
                                    <div className='form-group col-6'>
                                        <label htmlFor='date'>Enter a date:</label>
                                        <input type='date' className='form-control' id='date' value={inputDate} onChange={(e) => setInputDate(e.target.value)} required />
                                    </div>
                                    <div className='form-group col-6'>
                                        <label htmlFor='time'>Enter a time:</label>
                                        <input type='time' className='form-control' id='time' value={inputTime} onChange={(e) => setInputTime(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' aria-label='resetTime' onClick={handleResetTime} className='btn btn-reset btn-clean d-block'>Reset time</button>
                            <button type='button' aria-label='changeTime' onClick={handleSetTime} className='btn btn-submit btn-clean d-block'>Change time</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TimeMachinePopup;