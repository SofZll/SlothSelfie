import React, {useState, useEffect} from 'react';
import './css/pomodoroAnimation.css';

function PomodoroAnimation(isStudioTime, timeLeft, totalTime) {

    const [percentage, setPercentage] = useState(100);

    useEffect(() => {
        setPercentage(timeLeft / totalTime * 100);
    } , [timeLeft, totalTime]);
    

    return (
        <div className="pomodoro-animation">
        </div>
    );
}
export default PomodoroAnimation;
