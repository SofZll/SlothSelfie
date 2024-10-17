import React from 'react';
import './css/Pomodoro.css';


function PomodoroTimer({timeStudio, timeBreak, numberCycles, timeTotal}) {
    return (
        <div className="pomodoro-timer">
            <div className="song-container">

            </div>
            <div className="pomodoro-container">
            </div>
            <div className="stats-container">
            </div>
        </div>
    );
}

export default PomodoroTimer;