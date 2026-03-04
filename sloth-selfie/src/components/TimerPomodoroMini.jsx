import React, { useState } from 'react';

import { usePomodoro } from '../contexts/PomodoroContext';
import BigTomato from '../assets/icons/BigTomato';
import { formatTime } from '../utils/utils';

import { CirclePlay, CirclePause, CircleStop, CirclePlus, RotateCcw, SkipForward, SkipBack } from 'lucide-react';

const TimerPomodoroMini = () => {

    const { pomodoro, play, setPlay, resetPomodoro, newPomodoro, addCycle, skipTime, skipBack } = usePomodoro();

    const handleClick = async (call) => {
        
        call();
        setPlay(false);
    }

    return (
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <div className='d-flex fst-italic text-center mb-2'>
                It's {pomodoro.isStudyTime ? 'Study Time' : 'Break Time'} of your last {pomodoro.cyclesLeft} {pomodoro.cyclesLeft > 1 ? 'cycles' : 'cycle'}
            </div>

            <div className='d-flex justify-content-center align-items-center position-relative mb-2'>
                <BigTomato studyTime={pomodoro.isStudyTime} />
                <div className='position-absolute start-50 translate-middle-x' style={{ top: '45%' }}>
                    <h1 className='text-center text-light'>
                        {formatTime(pomodoro.timeLeft)}
                    </h1>
                </div>
            </div>

            {pomodoro.finished ? (
                <div className='d-flex justify-content-around align-items-center w-100'>
                    <button type='button' aria-label='Reset' title='Reset' className='btn m-0 p-1' onClick={() => handleClick(resetPomodoro)}>
                        <RotateCcw size='20' strokeWidth='1.5' />
                    </button>

                    <button type='button' aria-label='New pomodoro' title='New pomodoro' className='btn m-0 p-1' onClick={() => handleClick(newPomodoro)}>
                        <CircleStop size='20' strokeWidth='1.5' />
                    </button>

                    <button type='button' aria-label='Add cycle' title='Add cycle' className='btn m-0 p-1' onClick={() => handleClick(addCycle)}>
                        <CirclePlus size='20' strokeWidth='1.5' />
                    </button>
                </div>
            ) : (
                <div className='d-flex justify-content-around align-items-center w-100'>
                    <button type='button' aria-label='Skip back' title='Skip back' className='btn m-0 p-1' onClick={() => handleClick(skipBack)}>
                        <SkipBack size='20' strokeWidth='1.5' />
                    </button>

                    <button type='button' aria-label='Play' title='Play' className='btn m-0 p-1' onClick={() => setPlay(!play)}>
                        {play ? <CirclePause size='20' strokeWidth='1.5' /> : <CirclePlay size='20' strokeWidth='1.5' />}
                    </button>

                    <button type='button' aria-label='Next cycle' title='Next cycle' className='btn m-0 p-1' onClick={() => handleClick(skipTime)}>
                        <SkipForward size='20' strokeWidth='1.5' />
                    </button>
                </div>
            )}
            
        </div>
    );
}

export default TimerPomodoroMini;