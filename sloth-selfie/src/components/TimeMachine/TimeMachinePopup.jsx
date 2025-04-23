import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../../services/apiService';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';

// TODO: il resto delle funzioni

const TimeMachinePopup = () => {
    const { setMachineOpen, virtualNow, setVirtualNow, currentTime, currentDate } = useContext(TimeMachineContext);

    const [inputTime, setInputTime] = useState('');
    const [inputDate, setInputDate] = useState('');

    const handleSetTime = async (e) => {
        e.preventDefault();
        if (!inputDate || !inputTime) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please enter a date and time' });
            return;
        }

        const response = await apiService('/time/set-time', 'POST', { date: inputDate, time: inputTime });
        if (response.success) {
            console.log('Time set successfully:', response);
            setMachineOpen(false);
        } else {
            console.error('Error setting time');
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Error setting time' });
        }
    }

    const handleResetTime = async () => {
        const response = await apiService('/time/reset-time', 'POST');
        if (response.success) {
            console.log('Time reset successfully:', response);
            setInputDate('');
            setInputTime('');
        } else {
            console.error('Error resetting time');
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Error resetting time' });
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setVirtualNow(prev => new Date(prev.getTime() + 1000));
        }, 1000);
    
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='modal fade show time-machine-popup'>
            <div className='modal-dialog modal-dialog-centered custom-modal'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>Time Machine</h5>
                        <button type='button' className='close' onClick={() => setMachineOpen(false)}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className='modal-body col-12'>
                        <p>Right now the time is set on:</p>
                        <div className='d-flex justify-content-center gap-3 mb-3'>
                            <span>Date: {currentDate}</span>
                            <span>Time: {currentTime}</span>
                        </div>
                        <form onSubmit={handleSetTime}>
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
                            <button type='submit' className='btn btn-submit btn-clean d-block mx-auto mt-2'>Go back in time!</button>
                        </form>
                        <button onClick={handleResetTime} className='btn btn-reset btn-clean d-block mx-auto mt-2'>Reset time</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeMachinePopup;