import React, { useEffect, useState } from "react";
import './css/TimeMachine.css';
import Swal from "sweetalert2";

const TimeMachine = ({isOpen, onClose}) => {
    const [inputTime, setInputTime] = useState('');
    const [inputDate, setInputDate] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    //TODO: trova un modo per sincronizzare eventi, attività note ecc ecc con time machine


    
    /*
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
    

    // Fetch the current time from the server
    useEffect(() => {
        fetch('http://localhost:8000/api/time/fetch-state', {
            method: 'GET',
            credentials: 'include',
          })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Time is set on:', data);
                    setCurrentDate(data.timeEntry.date);
                    setCurrentTime(data.timeEntry.time);

                    /*find a way to set the state of everything
                    setActivities(data.state.activities);
                    setEvents(data.state.events);
                    setNotes(data.state.notes);
                    setNotifications(data.state.notifications);
                    setContents(data.state.contents);
                    

                }
            })
            .catch(error => {
                console.error("Error fetching selected time: ", error);
            });
    }, []);
    
    //no need if the others work
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        let combinedDateTime = '';
        const buttonClicked = e.nativeEvent.submitter.value;
        if (buttonClicked === 'set-time' && !inputTime && !inputDate) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a date and time',
            });

            return;
        } else if (buttonClicked === 'set-time' && inputTime && inputDate) {
            combinedDateTime = `${inputDate}T${inputTime}:00.000Z`;
        } else if (buttonClicked === 'reset-time') {
            const now = new Date();
            combinedDateTime = now.toISOString();
        }

        try {
            const response = await fetch('http://localhost:8000/api/time/fetch-state',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ combinedDateTime })   
            })

            if (response.ok) {
                const data = await response.json();
                console.log('State fetched:', data);
            } else {
                console.error('Error fetching state');
            }

            onClose();
        } catch (error) {
            console.error('Error setting time:', error);
        }
    }
    */

    // Function to set the time
    const handleSetTime = async (e) => {
        e.preventDefault();

        if (!inputDate || !inputTime) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a date and time',
            });
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/time/set-time", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: inputDate, time: inputTime }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Time set successfully:', data);
                setCurrentDate(inputDate);
                setCurrentTime(inputTime);
                onClose();
            } else {
                console.error('Error setting time');
            }
        } catch (error) {
            console.error('Error setting time:', error);
        }
    };

    // Function to reset the time
    const handleResetTime = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/time/reset-time", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Time reset successfully:', data);
                setCurrentDate(data.timeEntry.date);
                setCurrentTime(data.timeEntry.time);
                setInputDate('');
                setInputTime('');
            } else {
                console.error('Error resetting time');
            }
        } catch (error) {
            console.error('Error resetting time:', error);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="time-machine">
            <div className="time-machine-content">
                <span className="close" onClick={onClose}>&times;</span>
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
    )
};

export default TimeMachine;
