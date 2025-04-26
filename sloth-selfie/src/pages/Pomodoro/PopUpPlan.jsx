import React, { useState } from 'react';

import Swal from 'sweetalert2';
import { apiService } from '../../services/apiService';
import { usePomodoro } from '../../contexts/PomodoroContext';
import ShareInput from '../../components/ShareInput';

const PopUpPlan = () => {

    const { resetPopUp } = usePomodoro();
    const [pomodoro, setPomodoro] = useState({
        title: 'Pomodoro',
        deadline: new Date(),
        studyTime: 30,
        breakTime: 5,
        cycles: 5,
        sharedWith: []
    });

    const resetPomodoro = () => {
        setPomodoro({
            title: 'Pomodoro',
            deadline: new Date(),
            studyTime: 30,
            breakTime: 5,
            cycles: 5,
            sharedWith: []
        }); 
    }

    const setDeadline = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        setPomodoro({ ...pomodoro, deadline: newDate });
    }

    const addPomodoroCalendar = async () => {
        if (!pomodoro.title || !pomodoro.deadline || !pomodoro.studyTime || !pomodoro.breakTime || !pomodoro.cycles) {
            Swal.fire({
                title: 'Error',
                icon: 'error',
                text: 'Please fill all fields',
                customClass: { confirmButton: 'button-alert' },
            });
            return;
        }

        const response = await apiService('/pomodoro/calendar', 'POST', pomodoro);
        if (response.success) Swal.fire({ icon: 'success', title: 'Success', text: 'Pomodoro added successfully', customClass: { confirmButton: 'button-alert' } });
        else Swal.fire({ icon: 'error', title: 'Error', text: 'Error adding pomodoro', customClass: { confirmButton: 'button-alert' } });

        resetPopUp();
        resetPomodoro();
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
                        value={pomodoro.title}
                        onChange={(e) => setPomodoro({ ...pomodoro, title: e.target.value })}
                    />
                </div>
            </div>

            <div className='d-flex justify-content-center w-100 mt-3'>
                <div className='col-12'>
                    <label className='form-label'>Date</label>
                    <input
                        type='date'
                        className='form-control'
                        value={pomodoro.deadline.toISOString().split('T')[0]}
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
                        value={pomodoro.studyTime}
                        onChange={(e) => setPomodoro({ ...pomodoro, studyTime: e.target.value })}
                    />
                </div>
                <div className='col-6'>
                    <label className='form-label'>Break Time</label>
                    <input
                        type='number'
                        className='form-control'
                        placeholder='minutes'
                        value={pomodoro.breakTime}
                        onChange={(e) => setPomodoro({ ...pomodoro, breakTime: e.target.value })}
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
                        value={pomodoro.cycles}
                        onChange={(e) => setPomodoro({ ...pomodoro, cycles: e.target.value })}
                    />
                </div>
            </div>

            <div className='d-flex justify-content-center w-100 mt-3'>
                <div className='col-12'>
                    <label className='form-label'>Share your Pomodoro</label>
                    <ShareInput receivers={pomodoro.sharedWith} setReceivers={(receivers) => setPomodoro({ ...pomodoro, sharedWith: receivers })} />
                </div>
            </div>

            <button className='btn bg-sloth-blue btn-outline-light mt-3' onClick={() => addPomodoroCalendar()}>
                save
            </button>
        </div>
    );
}

export default PopUpPlan;