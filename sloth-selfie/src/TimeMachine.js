import React, { useEffect, useState } from "react";
import './css/TimeMachine.css';

const TimeMachine = ({isOpen, onClose}) => {
    const [inputTime, setInputTime] = useState('');
    const [inputDate, setInputDate] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    
    useEffect(() => {
        // Message for future me: comment once the server is running
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].slice(0, 5);
        setCurrentDate(date);
        setCurrentTime(time);

        // The server returns the current time if there is no time set
        // Fetch selected time from server
        fetch('http://localhost:8000/api/time/selected-time')
            .then(response => response.json())
            .then(data => {
                console.log('Time is set on:', data);
                setCurrentDate(data.date);
                setCurrentTime(data.time);
            })
            .catch(error => {
                console.error("Error fetching selected time: ", error);
            }); 
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const buttonClicked = e.nativeEvent.submitter.value;
        if (buttonClicked === 'reset-time') {
            if (inputTime && inputDate) {
                fetch('http://localhost:8000/api/time/set-time',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({inputTime, inputDate})
                })
                .then(response => response.json())
                .then(data => {
                    alert(`You have chosen to go back to: ${inputDate} ${inputTime}`);
                    console.log('Time set:', data);
                })
                .catch(error => {
                    console.error("Error setting time: ", error);
                });
                onClose();
            } else {
                alert("No time entered. Please try again.");
            }
        }
        else if (buttonClicked === 'reset-time') {
            fetch('http://localhost:8000/api/time/reset-time')
            .then(response => response.json())
            .then(data => {
                alert('Time has been reset!');
                console.log('Time reset:', data);
            })
            .catch(error => {
                console.error("Error resetting time: ", error);
            });
            onClose();
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="time-machine">
            <div className="time-machine-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Hi! &#128527;<br/> Do you wish to go back in time?</h2>
                <p>Right now the time is set on: </p>
                <p className="current-time">
                    <span>Date: {currentDate}</span>
                    <span>Time: {currentTime}</span>
                </p>
                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn" value="set-time">Go back in time!</button>
                    <button type="submit" className="btn" value="reset-time">Reset time</button>
                </form>
            </div>
        </div>
    )
};

export default TimeMachine;
