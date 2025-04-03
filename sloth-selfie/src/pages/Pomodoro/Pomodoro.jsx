import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import TimerPomodoro from './TimerPomodoro';

import { PomodoroProvider } from '../../contexts/PomodoroContext';

const Pomodoro = () => {
    return (
        <PomodoroProvider>
            <MainLayout>
                <div className='row d-flex w-100 h-75 justify-content-center align-items-center position-relative'>
                    <div className='col-md-6 col-12'>
                        <TimerPomodoro />
                    </div>

                    
                </div>
            </MainLayout>
        </PomodoroProvider>
    );
}

export default Pomodoro;