import React from 'react';

import Swal from 'sweetalert2';
import { apiService } from '../services/apiService';
import { usePomodoro } from '../contexts/PomodoroContext';

const PopUpPlanPomodoro = ({ edit }) => {

    const { resetPopUp, resetSettingsPomodoro, settingsPomodoro, setSettingsPomodoro } = usePomodoro();

    const setDeadline = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        setSettingsPomodoro({ ...settingsPomodoro, deadline: newDate });
    }

    const submitPomodoroCalendar = async () => {
        if (!settingsPomodoro.title || !settingsPomodoro.deadline || !settingsPomodoro.studyTime || !settingsPomodoro.breakTime || !settingsPomodoro.cycles) {
            Swal.fire({
                title: 'Error',
                icon: 'error',
                text: 'Please fill all fields',
                customClass: { confirmButton: 'button-alert' },
            });
            return;
        }

        const response = await apiService('/pomodoro/calendar', 'POST', settingsPomodoro);
        if (response.success) Swal.fire({ icon: 'success', title: 'Success', text: 'Pomodoro added successfully', customClass: { confirmButton: 'button-alert' } });
        else Swal.fire({ icon: 'error', title: 'Error', text: 'Error adding pomodoro', customClass: { confirmButton: 'button-alert' } });

        resetPopUp();
        resetSettingsPomodoro();
    }

    return (
        <div className='d-flex flex-column'>
            <div className='d-flex justify-content-center w-100 mt-3'>
                <div className='col-12'>
                    <label className='form-label'>Title</label>
                    <input
                        type='text'
                        className='form-control'
                        placeholder='Pomodoro title'
                        value={settingsPomodoro.title}
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, title: e.target.value })}
                    />
                </div>
            </div>

            <div className='d-flex justify-content-center w-100 mt-3'>
                <div className='col-12'>
                    <label className='form-label'>Date</label>
                    <input
                        type='date'
                        className='form-control'
                        value={settingsPomodoro.deadline ? new Date(settingsPomodoro.deadline).toISOString().split('T')[0] : ''}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
            </div>

            <div className='d-flex justify-content-center w-100 mt-3'>
                <div className='col-6'>
                    <label className='form-label'>Study Time</label>
                    <input
                        type='number'
                        className='form-control'
                        placeholder='minutes'
                        value={settingsPomodoro.studyTime}
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, studyTime: e.target.value })}
                    />
                </div>
                <div className='col-6'>
                    <label className='form-label'>Break Time</label>
                    <input
                        type='number'
                        className='form-control'
                        placeholder='minutes'
                        value={settingsPomodoro.breakTime}
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, breakTime: e.target.value })}
                    />
                </div>
            </div>
            <div className='d-flex justify-content-center w-100 mt-3'>
                <div className='col-8'>
                    <label className='form-label'>Cycles</label>
                    <input
                        type='number'
                        className='form-control'
                        placeholder='number of cycles'
                        value={settingsPomodoro.cycles}
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, cycles: e.target.value })}
                    />
                </div>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button className='btn-main rounded shadow-sm mt-4' onClick={() => submitPomodoroCalendar()}>
                    save
                </button>
            </div>
        </div>
    );
}

export default PopUpPlanPomodoro;