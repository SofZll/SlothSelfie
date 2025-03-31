import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';

import { PomodoroProvider } from '../../contexts/PomodoroContext';

const Pomodoro = () => {
    return (
        <PomodoroProvider>
            <MainLayout>
                <div className='row w-100 h-75'>
                    <div className='col-3'>
                    </div>
                    <div className='col-6'>
                        <TimerPomodoro />
                    </div>
                    <div className='col-3'>
                    </div>
                </div>
            </MainLayout>
        </PomodoroProvider>
    );
}

export default Pomodoro;