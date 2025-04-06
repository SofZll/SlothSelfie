import React, { useState } from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';
import { AudioLines, X } from 'lucide-react';

import { PomodoroProvider } from '../../contexts/PomodoroContext';

const Pomodoro = () => {
    const [music, setMusic] = useState({
        open: false,
        url: '',
        youtube: false,
        spotify: false,
    })

    return (
        <PomodoroProvider>
            <MainLayout>
                <div className='d-flex w-100 h-75 justify-content-center align-items-around position-relative'>
                    <TimerPomodoro />

                    <button className='btn position-absolute start-0 top-50 translate-middle ps-5 p-3 rounded-end-5 shadow-sm' style={{ backgroundColor: '#244476' }} onClick={() => setMusic({ ...music, open: !music.open })}>
                        {music.open ? (
                            <AudioLines size='30' color='#ffff' strokeWidth='1.5' />
                        ) : (
                            <X size='30' color='#ffff' strokeWidth='1.5' />
                        )}
                    </button>
                </div>
            </MainLayout>
        </PomodoroProvider>
    );
}

export default Pomodoro;