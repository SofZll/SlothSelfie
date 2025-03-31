import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';

import { PomodoroProvider } from '../../contexts/PomodoroContext';

const Pomodoro = () => {
    return (
        <PomodoroProvider>
            <MainLayout>
                <h1>Pomodoro</h1>
                <TimerPomodoro />
            </MainLayout>
        </PomodoroProvider>
    );
}

export default Pomodoro;