import React, {useState, useEffect} from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { AnimationPencil } from './AnimationPencil';


import { Share, Pen, RotateCcw, SkipForward, SkipBack, CirclePlay, CirclePause, CircleStop, CirclePlus, CalendarPlus, Music } from 'lucide-react';



const TimerPomodoro = () => {
    const { play, setPlay, pomodoro, settingsPomodoro, increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, skipTime, skipBack, popUp, setPopUp } = usePomodoro();
    const [inShare, setInShare] = useState(false);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    useEffect(() => {
        if (pomodoro.finished) setPlay(false);
    }, [pomodoro.finished]);
            
    useEffect(() => {
        setPlay(false);
    }, [pomodoro.isStudyTime]);

    useEffect(() => {
        if (!inShare) {
            if (play) {

                const interval = setInterval(() => {
                    increasePomodoroTime();
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [play, inShare, pomodoro]);


    return (
        <div>
            <div className='d-flex justify-content-between'>
                <button className='btn' onClick={() => setPopUp({ ...popUp, share: !popUp.share })}>
                    <Share size='30' color='#244476' strokeWidth='1.5' />
                </button>

                <button className='btn' onClick={() => setPopUp({ ...popUp, calendar: !popUp.calendar })}>
                    <CalendarPlus size='30' color='#244476' strokeWidth='1.5' />
                </button>
                
                <button className='btn' onClick={() => setPopUp({ ...popUp, music: !popUp.music })}>
                    <Music size='30' color='#244476' strokeWidth='1.5' />
                </button>
            </div>

            <div className='d-flex justify-content-center'>
                {pomodoro.finished ? (
                    <>
                        Congratulation! <br /> You have studied for {formatTime(pomodoro.studiedTime)} minutes
                    </>
                ) : (
                    <>
                    {pomodoro.started ? (
                        <>
                            You still have {formatTime(pomodoro.timeLeft)} minutes {pomodoro.isStudyTime ? 'to study' : 'in your break'}
                        </>
                    ) : (
                        <>
                            Let's start a new Pomodoro session
                        </>
                    )}
                    </>
                )}
            </div>

            <div className='d-flex justify-content-center'>
                <AnimationPencil />
            </div>

            <div className='d-flex justify-content-center'>
                {pomodoro.finished ? (
                    <>
                        Reset or add a cycle to your Pomodoro session
                    </>
                ) : (
                    <>
                    {pomodoro.started ? (
                        <>
                            Cycle {settingsPomodoro.cycles + settingsPomodoro.additionalCycles - pomodoro.cyclesLeft + 1} of {settingsPomodoro.cycles + settingsPomodoro.additionalCycles}
                        </>
                    ) : (
                        <>
                            Press play to start the Pomodoro session
                        </>
                    )}
                    </>
                )}
            </div>

            <div className='d-flex justify-content-between'>
                <button className='btn' onClick={() => setPopUp({ ...popUp, edit: !popUp.edit })}>
                    <Pen size='30' color='#244476' strokeWidth='1.5' />
                </button>

                {pomodoro.finished ? (
                    <button className='btn' onClick={() => resetPomodoro()}>
                        <RotateCcw size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                ) : (
                    <button className='btn' onClick={() => skipBack()}>
                        <SkipBack size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                )}

                {pomodoro.finished ? (
                    <button className='btn' onClick={() => newPomodoro()}>
                        <CircleStop size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                ) : (
                    <button className='btn' onClick={() => setPlay(!play)}>
                        {play ? <CirclePause size='30' color='#244476' strokeWidth='1.5' /> : <CirclePlay size='30' color='#244476' strokeWidth='1.5' />}
                    </button>
                )}

                {pomodoro.finished ? (
                    <button className='btn' onClick={() => addCycle()}>
                        <CirclePlus size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                ) : (
                    <button className='btn' onClick={() => skipTime()}>
                        <SkipForward size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                )}

            </div>

        </div>
    );
}

export default TimerPomodoro;