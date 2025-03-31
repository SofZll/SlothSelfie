import React, {useState, useEffect} from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';

import { Share, Pen, RotateCcw, SkipForward, CirclePlay, CirclePause, CircleStop, CirclePlus } from 'lucide-react';
import { use } from 'react';


const TimerPomodoro = () => {
    const { pomodoro, setPomodoro, settingsPomodoro, setSettingsPomodoro, increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, editSettingsPomodoro, skipTime } = usePomodoro();
    const [play, setPlay] = useState(false);
    const [inShare, setInShare] = useState(false);
    const [popupShare, SetPopupShare] = useState(false);
    const [popupEdit, SetPopupEdit] = useState(false);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    useEffect(() => {
        if (pomodoro.finished) setPlay(false);
    }, [pomodoro.finished]);
            

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
            <div className='row w-100'>
                <div className='col'>
                    <button className='btn' onClick={() => SetPopupShare(true)}>
                        <Share size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                </div>
            </div>

            <div className='row w-100'>
                <div className='col'>
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
            </div>

            <div className='row w-100'>
                <div className='col'>
                    {/* TODO: animazione */}
                </div>
            </div>

            <div className='row w-100'>
                <div className='col'>
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
            </div>

            <div className='row w-100'>
                <div className='col'>
                    <button className='btn' onClick={() => SetPopupEdit(true)}>
                        <Pen size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                </div>
                <div className='col'>
                    <button className='btn' onClick={() => resetPomodoro()}>
                        <RotateCcw size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                </div>

                {pomodoro.finished ? (
                    <div className='col'>
                        <button className='btn' onClick={() => newPomodoro()}>
                            <CircleStop size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    </div>
                ) : (
                    <div className='col'>
                        <button className='btn' onClick={() => setPlay(!play)}>
                            {play ? <CirclePause size='30' color='#244476' strokeWidth='1.5' /> : <CirclePlay size='30' color='#244476' strokeWidth='1.5' />}
                        </button>
                    </div>
                )}

                {pomodoro.finished ? (
                    <div className='col'>
                        <button className='btn' onClick={() => addCycle()}>
                            <CirclePlus size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    </div>
                ) : (
                    <div className='col'>
                        <button className='btn' onClick={() => skipTime()}>
                            <SkipForward size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    </div>
                )}

            </div>

        </div>
    );
}

export default TimerPomodoro;