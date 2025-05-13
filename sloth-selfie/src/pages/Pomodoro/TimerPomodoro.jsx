import React, { useEffect, useState } from 'react';

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
        resetAnimation,
        socketData, setSocketData, resetPopUp } = usePomodoro();

    const { pomodoroId } = useParams();
    const navigate = useNavigate();
    const [startStudiedTime, setStartStudiedTime] = useState(0);

    
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

    const createSession = async () => {
        if (!pomodoro._id || pomodoro._id === '') {
            console.log('Creating pomodoro', {...settingsPomodoro, title: 'Pomodoro shared'});
            const response = await apiService('/pomodoro', 'POST', {...settingsPomodoro, title: 'Pomodoro shared'});
            if (response.success) {
                console.log('Pomodoro created successfully', response);
                setSettingsPomodoro({...settingsPomodoro, _id: response.pomodoro._id, title: 'Pomodoro shared'});
                setPomodoro({...pomodoro, _id: response.pomodoro._id, title: 'Pomodoro shared'});
            } else console.log('Error creating pomodoro ', response.message);
        }
    }

    const addJoinedPomodoro = async (data) => {
        setStartStudiedTime(data.pomodoro.studiedTime);
        console.log(data, 'data');
        const response = await apiService('/pomodoro', 'POST', {...data.settingsPomodoro, title: 'Pomodoro shared'});
        if (response.success) {
            console.log('Pomodoro created successfully', response);
            setSettingsPomodoro(response.pomodoro);
            const result = await apiService(`/pomodoro/update-cycles/${response.pomodoro._id}`, 'PUT', {...data.pomodoro, studiedTime: data.pomodoro.studiedTime - startStudiedTime});

            if (!result.success) console.log('Error adding pomodoro to the database ', result.message);
            else {
                setPomodoro({...data.pomodoro, studiedTime: data.pomodoro.studiedTime - startStudiedTime});
                console.log('Pomodoro created successfully', response);
            }
        } else console.log('Error creating pomodoro ', response.message);
    }

    const saveNextCycle = async (data) => {
        const response = await apiService(`/pomodoro/${settingsPomodoro._id}`, 'PUT', {...data.pomodoro, studiedTime: data.pomodoro.studiedTime - startStudiedTime});
        if (!response.success) console.log('Error updating pomodoro ', response.message);
    }

    const updateData = async (data) => {
        if(data.settingsPomodoro.additionalCycles !== settingsPomodoro.additionalCycles) {
            const response = await apiService(`/pomodoro/add-additional-cycle/${settingsPomodoro._id}`, 'PUT', {additionalCycles: data.settingsPomodoro.additionalCycles});
            if (!response.success) console.log('Error updating pomodoro ', response.message);
            else setSettingsPomodoro({...settingsPomodoro, additionalCycles: data.settingsPomodoro.additionalCycles, finished: false});
        }

        if (data.settingsPomodoro.cycles !== settingsPomodoro.cycles || data.settingsPomodoro.studyTime !== settingsPomodoro.studyTime || data.settingsPomodoro.breakTime !== settingsPomodoro.breakTime) {
            const response = await apiService(`/pomodoro/${settingsPomodoro._id}`, 'PUT', {...data.settingsPomodoro, title: 'Pomodoro shared', deadline: settingsPomodoro.deadline});
            if (!response.success) console.log('Error updating pomodoro ', response.message);
            else setSettingsPomodoro({...settingsPomodoro, studyTime: data.settingsPomodoro.studyTime, breakTime: data.settingsPomodoro.breakTime, cycles: data.settingsPomodoro.cycles});
        }
        
        const response = await apiService(`/pomodoro/update-cycles/${settingsPomodoro._id}`, 'PUT', {...data.pomodoro, studiedTime: data.pomodoro.studiedTime - startStudiedTime});
        if (!response.success) console.log('Error updating pomodoro ', response.message);
        else {
            setPomodoro({...pomodoro, ...data.pomodoro});
            console.log('Pomodoro updated successfully', response);
        }
    }

    
    useEffect(() => {
        if (!socketData.inShare && play) {
            let start = performance.now();
            let prevElapsed = 0;
            let frameId;

            const tick = async (now) => {
                const elapsed = Math.floor((now - start) / 1000);

                if (elapsed > prevElapsed) {
                    prevElapsed = elapsed;
                    await increasePomodoroTime();
                }

                frameId = requestAnimationFrame(tick);
            };

            frameId = requestAnimationFrame(tick);

            return () => cancelAnimationFrame(frameId);
        }
    }, [play, socketData.inShare, increasePomodoroTime]);

    useEffect(() => {

        socket.on('session created', ({ sessionCode }) => {
            setSocketData({ inShare: true, room: sessionCode, peopleInSession: 1 });
            createSession();
            console.log('Session created with code: ', sessionCode);
        });

        socket.on('session joined', (data) => {
            setSocketData({ ...socketData, inShare: true, peopleInSession: data.peopleInSession });
            setPlay(data.play);
            console.log('Session joined with code: ', data.sessionCode);
            addJoinedPomodoro(data);
        });

        socket.on('number of people', ({ peopleInSession }) => {
            setSocketData({ ...socketData, peopleInSession });
        });

        socket.on('play', ({ play }) => {
            setPlay(play);
        });

        socket.on('updated data session', (data) => {
            updateData(data);
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
            setPomodoro({...data.pomodoro, studiedTime: data.pomodoro.studiedTime - startStudiedTime});
        });

        socket.on('end cycle', async (data) => {
            const newPomodoroData = await data.pomodoro;
            setPomodoro({...newPomodoroData, studiedTime: newPomodoroData.studiedTime - startStudiedTime});
            setPlay(false);
            saveNextCycle(data);
        });

        return () => {
            socket.off('session created');
            socket.off('session joined');
            socket.off('number of people');
            socket.off('play');
            socket.off('updated data session');
            socket.off('session closed');
            socket.off('error');
            socket.off('passing time');
            socket.off('end cycle');
        }

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