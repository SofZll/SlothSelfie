import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';

import { PomodoroProvider } from '../../contexts/PomodoroContext';
import { MusicProvider } from '../../contexts/MusicContext';

import '../../styles/Pomodoro.css';

const Pomodoro = () => {

    return (
        <PomodoroProvider>
            <MusicProvider>
                <MainLayout>
                    <div className='d-flex w-100 h-75 justify-content-center align-items-around position-relative'>
                        <TimerPomodoro />

                    </div>
                </MainLayout>
            </MusicProvider>
        </PomodoroProvider>
    );
}

export default Pomodoro;