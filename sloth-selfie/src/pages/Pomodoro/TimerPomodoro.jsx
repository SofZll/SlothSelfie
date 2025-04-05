import React, { useEffect } from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { AnimationPencil } from './AnimationPencil';
import PopUpPomodoro from './PopUpPomodoro';

import { Share, Pen, RotateCcw, SkipForward, SkipBack, CirclePlay, CirclePause, CircleStop, CirclePlus, CalendarPlus, Music } from 'lucide-react';


const TimerPomodoro = () => {
    const { play, setPlay, pomodoro, settingsPomodoro, increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, skipTime, skipBack, popUp, setPopUp, socketData } = usePomodoro();

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    useEffect(() => {
        if (!socketData.inShare) {
            if (play) {

                const interval = setInterval(() => {
                    increasePomodoroTime();
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [play, socketData.inShare, pomodoro, increasePomodoroTime]);


    return (
        <>
        { popUp.open ? (
            <PopUpPomodoro />
        ) : (
            <div className='d-flex flex-column w-100 h-100 justify-content-around align-items-center'>
                <div className='d-flex col-md-6 col-10 justify-content-between'>
                    <button className='btn' onClick={() => setPopUp({ ...popUp, share: !popUp.share, open: !popUp.open })}>
                        <Share size='30' color='#244476' strokeWidth='1.5' />
                    </button>

                    <button className='btn' onClick={() => setPopUp({ ...popUp, calendar: !popUp.calendar, open: !popUp.open })}>
                        <CalendarPlus size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                    
                    <button className='btn' onClick={() => setPopUp({ ...popUp, music: !popUp.music, open: !popUp.open })}>
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

                <div className='d-flex col-md-6 col-10 justify-content-between'>
                    <button className='btn' onClick={() => setPopUp({ ...popUp, edit: !popUp.edit, open: !popUp.open })}>
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
        )}
        </>
        
    );
}

export default TimerPomodoro;