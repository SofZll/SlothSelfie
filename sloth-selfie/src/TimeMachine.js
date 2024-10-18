import React, { useState } from "react";
import "./css/App.css";

const TimeMachine = ({isOpen, onClose}) => {
    const [inputTime, setInputTime] = useState('');
    const [inputDate, setInputDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputTime && inputDate) {
          alert(`You have chosen to go back to: ${inputDate} ${inputTime}`);
          onClose();
        } else {
          alert("No time entered. Please try again.");
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="time-machine">
            <div className="time-machine-content">
            <span className="close" onClick={onClose}>&times;</span>
                <h2>Hi "user"! <br/> Do you wish to go back in time?</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="date">Enter a date:</label>
                    <input
                        className="time-input"
                        type="date"
                        id="date"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        required
                    />
                    <label htmlFor="time">Enter a time:</label>
                    <input
                        className="time-input"
                        type="time"
                        id="time"
                        value={inputTime}
                        onChange={(e) => setInputTime(e.target.value)}
                        required
                    /><br/><br/>
                    <button type="submit" className="btn">Go back in time!</button>
                </form>
            </div>
        </div>
    )
};

export default TimeMachine;
