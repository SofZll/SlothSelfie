import React, { useEffect } from 'react';

import socket from '../../services/socket';
import { usePomodoro } from '../../contexts/PomodoroContext';

import Swal from 'sweetalert2';

const SoketPomodoro = () => {

    const { play, setPlay, 
        pomodoro, setPomodoro, settingsPomodoro, setSettingsPomodoro,
        cycleTime,
        popUp, setPopUp, resetPopUp,
        socketData, setSocketData,
        toRefresh, setToRefresh } = usePomodoro();


    useEffect(() => {
        if (socketData.inShare) {
            socket.connect();
            setPlay(false);

            if (socketData.room) socket.emit('join session', { room: socketData.room });
            else socket.emit('create session', { settingsPomodoro, pomodoro, play });
        
            return () => {
                socket.disconnect();
            }
        } else socket.emit('disconnect');

    }, [socketData.inShare]);


    useEffect(() => {
        console.log('play', play);
        socket.emit('play', { play });
        
    }, [play]);

    useEffect(() => {
        if (toRefresh) socket.emit('updated data session', { settingsPomodoro, pomodoro, play });
    }, [toRefresh]);


    useEffect(() => {
        socket.on('session created', ({ sessionCode }) => {
            setSocketData({ ...socketData, room: sessionCode, peopleInSession: 1 });
        });

        socket.on('session joined', (data) => {
            setSocketData({ ...socketData, peopleInSession: data.peopleInSession });
            setSettingsPomodoro(data.settingsPomodoro);
            setPomodoro(data.pomodoro);
            setPlay(data.play);
        });

        socket.on('number of people', ({ peopleInSession }) => {
            setSocketData({ ...socketData, peopleInSession });
        });

        socket.on('error', ({ message }) => {
            Swal.fire({ icon: 'error', title: 'Oops...', text: message,});
        });

        socket.on('session closed', () => {
            setSocketData({ inShare: false, room: '', peopleInSession: 0 });
            resetPopUp();
            setPlay(false);
            Swal.fire({ icon: 'success', title: 'Session closed', text: 'The session was closed by the host.' });
        })

        socket.on('play', (data) => {
            setPlay(data.play);
        });

        socket.on('updated data session', (data) => {
            setSettingsPomodoro(data.settingsPomodoro);
            setPomodoro(data.pomodoro);
            setPlay(data.play);
            setToRefresh(false);
            cycleTime(pomodoro.isStudyTime ? data.settingsPomodoro.studyTime : data.settingsPomodoro.breakTime);
        });

        socket.on('passing time', (data) => {
            setPomodoro(data.pomodoro);
            setPlay(data.play);
        });

        return () => {
            socket.off('session created');
            socket.off('user joined');
        }
    }, [socketData, setSocketData, setPopUp, setPlay, setPomodoro, setSettingsPomodoro, cycleTime, popUp, pomodoro.isStudyTime]);


    return null;

};

export default SoketPomodoro;