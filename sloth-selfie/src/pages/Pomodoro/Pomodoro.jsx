import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';

import { PomodoroProvider } from '../../contexts/PomodoroContext';
import { MusicProvider } from '../../contexts/MusicContext';
import { CalendarProvider } from '../../contexts/CalendarContext';

import '../../styles/Pomodoro.css';

const Pomodoro = () => {

    return (
        <PomodoroProvider>
            <MusicProvider>
                <CalendarProvider>
                    <MainLayout>
                        <div className='d-flex w-100 h-75 justify-content-center align-items-around position-relative overflow-auto'>
                            <TimerPomodoro />

                        </div>
                    </MainLayout>
                </CalendarProvider>
            </MusicProvider>
        </PomodoroProvider>
    );
}

export default Pomodoro;