import React, { useState, useEffect } from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';

import '../../styles/PomodoroAnimation.css';

const AnimationPencil = () => {

    const { animation, setAnimation, play, pomodoro } = usePomodoro();
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        if (animation.reset) {
            setAnimationKey(prevKey => prevKey + 1);
            setAnimation({ ...animation, reset: false });
        }
    }, [animation.reset]);

    useEffect(() => {
        document.documentElement.style.setProperty('--animation-duration-pencil', animation.pencilTime);
        document.documentElement.style.setProperty('--animation-duration-line', animation.lineTime);
        document.documentElement.style.setProperty('--animation-delay-go', animation.delayGo);
        document.documentElement.style.setProperty('--animation-delay-back', animation.delayBack);
    }, [animation.pencilTime, animation.lineTime, animation.delayGo, animation.delayBack]);

    useEffect(() => {
        if (play) {
            document.documentElement.style.setProperty('--animation-running', 'running');
        } else {
            document.documentElement.style.setProperty('--animation-running', 'paused');
        }
    }, [play]);


    return (
        <div key={animationKey} className='d-flex justify-content-center align-items-center position-relative animation-box'>
            <div className={`pencil ${pomodoro.isStudyTime ? 'study-pencil' : 'break-pencil'}`}>

                <span className='content-pencil'></span>
                <span className={`ink ${pomodoro.isStudyTime ? 'study-ink' : 'break-ink'}`}></span>

            </div>
            <span className={`line ${pomodoro.isStudyTime ? 'study-line' : 'break-line'}`}></span>

        </div>
    );
}

export { AnimationPencil };
