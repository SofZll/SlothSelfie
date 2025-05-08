import React, { useEffect } from 'react';

import { AnimationPencil } from './AnimationPencil';
import PopUpPomodoro from './PopUpPomodoro';
import MusicPomodoro from './MusicPomodoro';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { formatTime } from '../../utils/utils';
import socket from '../../services/socket/socket';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';

import { Share, Pen, RotateCcw, SkipForward, SkipBack, CirclePlay, CirclePause, CircleStop, CirclePlus, CalendarPlus, ChartLine, Music } from 'lucide-react';
import { NewSwal } from '../../utils/swalUtils';


const TimerPomodoro = () => {
    const { play, setPlay,
        pomodoro, setPomodoro,
        settingsPomodoro, setSettingsPomodoro, resetSettingsPomodoro,
        increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, skipTime, skipBack,
        popUp, setPopUp,
        editTimeAnimation, resetAnimation,
        socketData, setSocketData, resetPopUp } = usePomodoro();

    const { pomodoroId } = useParams();
    const navigate = useNavigate();

    
    const handlePlay = () => {
        if (socketData.inShare) {
            socket.emit('play', { play: !play });
        } else setPlay(!play);
    }

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
            NewSwal.fire({ icon: 'success', title: 'Session closed', text: 'You have exited the session.' });
            setSocketData({ inShare: false, room: '', peopleInSession: 0 });
            setPlay(false);
            resetPopUp();
        });

        socket.on('error', ({ message }) => {
            NewSwal.fire({ icon: 'error', title: 'Oops...', text: message });
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

    //get the id of the pomodoro from the url
    useEffect(() => {

        const fetchPomodoro = async () => {
            const response = await apiService(`/pomodoro/${pomodoroId}`, 'GET');
            if (response.success) {
                setSettingsPomodoro({ ...response.pomodoro });
                setPomodoro({ ...response.pomodoro, timeLeft: (response.pomodoro.isStudyTime ? response.pomodoro.studyTime : response.pomodoro.breakTime), cyclesLeft: (response.pomodoro.cyclesLeft || response.pomodoro.cycles) });
                resetAnimation(pomodoro.timeLeft);
            } else {
                NewSwal({ icon: 'error', title: 'Error', text: response.message });
                navigate('/pomodoro');
            }
        }

        
        if (pomodoroId) fetchPomodoro();
        else {
            resetSettingsPomodoro();
            newPomodoro();
        }
    }, []);



    return (
        <div className='d-flex flex-column w-100 h-100 justify-content-around align-items-center position-relative'>

            { popUp.open && (
                <div className='d-flex justify-content-center align-items-center position-absolute pop-up w-100 h-100 start-0 top-0 bg-light bg-opacity-75' style={{ zIndex: 1000 }}>
                    <PopUpPomodoro />
                </div>
            )}

            <div className='d-flex flex-column w-100 h-100 justify-content-around align-items-center'>
                <div className='d-flex col-md-6 col-10 justify-content-between'>
                    <button type='button' aria-label='Share' title='Share' className='btn' onClick={() => setPopUp({ ...popUp, share: !popUp.share, open: !popUp.open })}>
                        <Share size='30' color='#244476' strokeWidth='1.5' />
                    </button>

                    <button type='button' aria-label='Add to calendar' title='Add to Calendar' className='btn' onClick={() => setPopUp({ ...popUp, calendar: !popUp.calendar, open: !popUp.open })}>
                        <CalendarPlus size='30' color='#244476' strokeWidth='1.5' />
                    </button>
                    
                    <button type='button' aria-label='Stats' title='Stats' className='btn' onClick={() => setPopUp({ ...popUp, stats: !popUp.stats, open: !popUp.open })}>
                        <ChartLine size='32' color='#244476' strokeWidth='1.6' />
                    </button>

                    <button type='button' aria-label='Music' title='Music' className='btn' onClick={() => setPopUp({ ...popUp, music: !popUp.music, open: !popUp.open })}>
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
                    <button type='button' aria-label='Edit' title='Edit' className='btn' onClick={() => setPopUp({ ...popUp, edit: !popUp.edit, open: !popUp.open })}>
                        <Pen size='30' color='#244476' strokeWidth='1.5' />
                    </button>

                    {pomodoro.finished ? (
                        <button type='button' aria-label='Reset' title='Reset' className='btn' onClick={() => handleClick(resetPomodoro, 'reset pomodoro')}>
                            <RotateCcw size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    ) : (
                        <button type='button' aria-label='Skip back' title='Skip back' className='btn' onClick={() => handleClick(skipBack, 'skip back')}>
                            <SkipBack size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    )}

                    {pomodoro.finished ? (
                        <button type='button' aria-label='new Pomodoro' title='New pomodoro' className='btn' onClick={() => handleClick(newPomodoro, 'new pomodoro')}>
                            <CircleStop size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    ) : (
                        <button type='button' aria-label='Play' title='Play' className='btn' onClick={() => handlePlay()}>
                            {play ? <CirclePause size='30' color='#244476' strokeWidth='1.5' /> : <CirclePlay size='30' color='#244476' strokeWidth='1.5' />}
                        </button>
                    )}

                    {pomodoro.finished ? (
                        <button type='button' aria-label='Add cycle' title='Add cycle' className='btn' onClick={() => handleClick(addCycle, 'add cycle')}>
                            <CirclePlus size='30' color='#244476' strokeWidth='1.5' />
                        </button>
                    ) : (
                        <button type='button' aria-label='Next cycle' title='Next cycle' className='btn' onClick={() => handleClick(skipTime, 'skip time')}>
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