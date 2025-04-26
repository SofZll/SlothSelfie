import React, { useEffect } from 'react';

import { AnimationPencil } from './AnimationPencil';
import PopUpPomodoro from './PopUpPomodoro';
import MusicPomodoro from './MusicPomodoro';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { formatTime } from '../../utils/utils';
import socket from '../../services/socket/socket';

import { Share, Pen, RotateCcw, SkipForward, SkipBack, CirclePlay, CirclePause, CircleStop, CirclePlus, CalendarPlus, ChartLine, Music } from 'lucide-react';
import Swal from 'sweetalert2';


const TimerPomodoro = () => {
    const { play, setPlay, pomodoro, setPomodoro, settingsPomodoro, setSettingsPomodoro,
        increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, skipTime, skipBack,
        popUp, setPopUp,
        socketData, setSocketData, resetPopUp } = usePomodoro();

    const handlePlay = () => {
        if (socketData.inShare) {
            socket.emit('play', { play: !play });
        } else setPlay(!play);
    }

    console.log('settingsPomodoro', settingsPomodoro);
    console.log('pomodoro', pomodoro);

    const handleClick = async (call, message) => {
        
        if (socketData.inShare) socket.emit(message);
        else {
            call();
            setPlay(false);
        }
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
    }, [play, socketData.inShare, increasePomodoroTime]);

    useEffect(() => {

        socket.on('session created', ({ sessionCode }) => {
            setSocketData({ inShare: true, room: sessionCode, peopleInSession: 1 });
        });

        socket.on('session joined', (data) => {
            setSocketData({ ...socketData, inShare: true, peopleInSession: data.peopleInSession });
            setSettingsPomodoro(data.settingsPomodoro);
            setPomodoro({...data.pomodoro});
            setPlay(data.play);
        });

        socket.on('number of people', ({ peopleInSession }) => {
            setSocketData({ ...socketData, peopleInSession });
        });

        socket.on('play', ({ play }) => {
            setPlay(play);
        });

        socket.on('updated data session', (data) => {
            setSettingsPomodoro({...data.settingsPomodoro});
            setPomodoro({...data.pomodoro});
            setPlay(false);
        });

        socket.on('session closed', () => {
            Swal.fire({ icon: 'success', title: 'Session closed', text: 'You have exited the session.' });
            setSocketData({ inShare: false, room: '', peopleInSession: 0 });
            setPlay(false);
            resetPopUp();
        });

        socket.on('error', ({ message }) => {
            Swal.fire({ icon: 'error', title: 'Oops...', text: message });
        });

        socket.on('passing time', async (data) => {
            setPomodoro({...data.pomodoro});
        });

        socket.on('end cycle', async (data) => {
            const newPomodoroData = await data.pomodoro;
            setPomodoro({...newPomodoroData});
            setPlay(false);
        });
    }, [socketData, setSocketData, setSettingsPomodoro, setPomodoro, setPlay, resetPopUp]);


    return (
        <div className='d-flex flex-column w-100 h-100 justify-content-around align-items-center position-relative'>

            { popUp.open && (
                <div className='d-flex justify-content-center align-items-center position-absolute pop-up w-100 h-100 start-0 top-0 bg-light bg-opacity-75' style={{ zIndex: 1000 }}>
                    <PopUpPomodoro />
                </div>
            )}

            <div className='d-flex flex-column w-100 h-100 justify-content-around align-items-center'>
                <div className='d-flex col-md-6 col-10 justify-content-between'>
                    <button className='btn' onClick={() => setPopUp({ ...popUp, share: !popUp.share, open: !popUp.open })}>
                        <Share size='30' color='#244476' strokeWidth='1.5' />
                    </button>

                    <button className='btn' onClick={() => setPopUp({ ...popUp, calendar: !popUp.calendar, open: !popUp.open })}>
                        <CalendarPlus size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                    
                    <button className='btn' onClick={() => setPopUp({ ...popUp, stats: !popUp.stats, open: !popUp.open })}>
                        <ChartLine size='32' color='#244476' strokeWidth='1.6' />
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
                        <button className='btn' onClick={() => handleClick(resetPomodoro, 'reset pomodoro')}>
                            <RotateCcw size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    ) : (
                        <button className='btn' onClick={() => handleClick(skipBack, 'skip back')}>
                            <SkipBack size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    )}

                    {pomodoro.finished ? (
                        <button className='btn' onClick={() => handleClick(newPomodoro, 'new pomodoro')}>
                            <CircleStop size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    ) : (
                        <button className='btn' onClick={() => handlePlay()}>
                            {play ? <CirclePause size='30' color='#244476' strokeWidth='1.5' /> : <CirclePlay size='30' color='#244476' strokeWidth='1.5' />}
                        </button>
                    )}

                    {pomodoro.finished ? (
                        <button className='btn' onClick={() => handleClick(addCycle, 'add cycle')}>
                            <CirclePlus size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    ) : (
                        <button className='btn' onClick={() => handleClick(skipTime, 'skip time')}>
                            <SkipForward size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    )}

                </div>

            </div>

            <MusicPomodoro />
        </div>
        
    );
}

export default TimerPomodoro;