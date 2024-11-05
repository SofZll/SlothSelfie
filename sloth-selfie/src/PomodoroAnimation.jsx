import React, {useState, useEffect} from 'react';
import './css/pomodoroAnimation.css';

function PomodoroAnimation(isStudioTime, timeLeft, totalTime) {

    const [percentage, setPercentage] = useState(100);

    useEffect(() => {
        setPercentage(timeLeft / totalTime * 100);
    } , [timeLeft, totalTime]);
    

    return (
        <div className="pomodoro-animation">
            .container
                .lcd-light
                .monitor
                .monitor-neck
                .monitor-base
                .desk
                .tower
                .chair-back
                .chair-bottom
                .clock
                    .hour
                    .minute
                .pillow
                .bed
                .human-wrapper
                    .human
                    .head
                        .eyes
                    .torso
                        .l-thigh
                        .l-lower-leg
                        .r-thigh
                        .r-lower-leg
                        .r-upper-arm
                        .r-lower-arm
                        .l-upper-arm
                        .l-lower-arm
        </div>
    );
}
export default PomodoroAnimation;
