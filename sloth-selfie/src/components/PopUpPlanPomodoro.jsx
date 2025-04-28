import React from 'react';

import { NewSwal } from '../utils/swalUtils';
import { apiService } from '../services/apiService';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useCalendar } from '../contexts/CalendarContext';

const PopUpPlanPomodoro = ({ edit }) => {

    const { resetSettingsPomodoro, settingsPomodoro, setSettingsPomodoro, plannedPomodori, setPlannedPomodori, resetPopUp } = usePomodoro();
    const { resetSelected } = useCalendar();

    const setDeadline = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        setSettingsPomodoro({ ...settingsPomodoro, deadline: newDate });
    }

    const submitPomodoroCalendar = async () => {
        if (!settingsPomodoro.title || !settingsPomodoro.deadline || !settingsPomodoro.studyTime || !settingsPomodoro.breakTime || !settingsPomodoro.cycles) {
            NewSwal({
                title: 'Error',
                icon: 'error',
                text: 'Please fill all fields',
                customClass: { confirmButton: 'button-alert' },
            });
            return;
        }

        if(edit) {
            const response = await apiService(`/pomodoro/${settingsPomodoro._id}`, 'PUT', settingsPomodoro);
            if (response.success) {
                NewSwal({ icon: 'success', title: 'Success', text: 'Pomodoro updated successfully'});
                setPlannedPomodori(plannedPomodori.map(p => p._id === settingsPomodoro._id ? settingsPomodoro : p));
            } else NewSwal({ icon: 'error', title: 'Error', text: 'Error updating pomodoro'});
        } else {
            const response = await apiService('/pomodoro/calendar', 'POST', settingsPomodoro);
            if (response.success) NewSwal({ icon: 'success', title: 'Success', text: 'Pomodoro added successfully'});
            else NewSwal({ icon: 'error', title: 'Error', text: 'Error adding pomodoro'});
        }

        resetSelected();
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
                        value={settingsPomodoro.studyTime/60}
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, studyTime: parseInt(e.target.value) * 60 })}
                    />
                </div>
                <div className='col-6'>
                    <label className='form-label'>Break Time</label>
                    <input
                        type='number'
                        className='form-control'
                        placeholder='minutes'
                        value={settingsPomodoro.breakTime/60}
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, breakTime: parseInt(e.target.value) * 60 })}
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
                        onChange={(e) => setSettingsPomodoro({ ...settingsPomodoro, cycles: parseInt(e.target.value) })}
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