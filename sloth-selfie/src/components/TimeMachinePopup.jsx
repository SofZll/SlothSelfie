import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/apiService';

const TimeMachinePopup = ({ setMachineOpen, setCurrentTime, currentTime, setCurrentDate, currentDate }) => {
    const [inputTime, setInputTime] = useState('');
    const [inputDate, setInputDate] = useState('');

    const handleSetTime = async (e) => {
        e.preventDefault();
        if (!inputDate || !inputTime) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please enter a date and time' });
            return;
        }

        const response = await apiService('/time/set-time', 'POST', { date: inputDate, time: inputTime });
        if (response) {
            console.log('Time set successfully:', response);
            setCurrentDate(inputDate);
            setCurrentTime(inputTime);
            setMachineOpen(false);
        } else {
            console.error('Error setting time');
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Error setting time' });
        }
    }

    const handleResetTime = async () => {
        const response = await apiService('/time/reset-time', 'POST');
        if (response) {
            console.log('Time reset successfully:', response);
            setCurrentDate(response.timeEntry.date);
            setCurrentTime(response.timeEntry.time);
            setInputDate('');
            setInputTime('');
        } else {
            console.error('Error resetting time');
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Error resetting time' });
        }
    }

    return (
        <div className='time-machine-popup'>
            <div className='time-machine-content'>
                <span className='close' onClick={() => setMachineOpen(false)}>&times;</span>
                <h2>Hi! &#128527;<br/> Do you wish to travel in time?</h2>
                <p>Right now the time is set on: </p>
                <p className="current-time">
                    <span>Date: {currentDate}</span>
                    <span>Time: {currentTime}</span>
                </p>
                <form onSubmit={handleSetTime}>
                    <label htmlFor="date">Enter a date:</label>
                    <input
                        className="time-input"
                        type="date"
                        id="date"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        required
                    /><br/>
                    <label htmlFor="time">Enter a time:</label>
                    <input
                        className="time-input"
                        type="time"
                        id="time"
                        value={inputTime}
                        onChange={(e) => setInputTime(e.target.value)}
                        required
                    /><br/><br/>
                    <button type="submit" className="btn btn-main" value="set-time">Go back in time!</button>
                </form>
                <button onClick={handleResetTime} className="btn btn-main" value="reset-time">Reset time</button>
            </div>
        </div>
    );
};

export default TimeMachinePopup;