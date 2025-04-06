import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';

import { PomodoroProvider } from '../../contexts/PomodoroContext';

const Pomodoro = () => {
    return (
        <PomodoroProvider>
            <MainLayout>
                <div className='d-flex w-100 h-75 justify-content-center align-items-around position-relative'>
                    <TimerPomodoro />
                </div>
            </MainLayout>
        </PomodoroProvider>
    );
}

export default Pomodoro;