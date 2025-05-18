import React, { useState } from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';
import Button from '../../components/Button';
import { NewSwal } from '../../utils/swalUtils';
import socket from '../../services/socket/socket';

const EditPomodoro = () => {

    const { editSettingsPomodoro, settingsPomodoro, resetPopUp, socketData } = usePomodoro();
    const [edit, setEdit] = useState({
        totalTime: (settingsPomodoro.cycles * settingsPomodoro.studyTime)/60 + ((settingsPomodoro.cycles - 1) * settingsPomodoro.breakTime)/60,
        cicles: settingsPomodoro.cycles,
        study: settingsPomodoro.studyTime/60,
        break: settingsPomodoro.breakTime/60,
    });

    const handleEdit = (e, setting) => {
        if (e.key === 'Enter') {
            if (setting < 4) setEdit({ ...edit, totalTime: edit.cicles * edit.study + (edit.cicles - 1) * edit.break });
            else {

                if (edit.totalTime < 35) {
                    setEdit({ ...edit, study: edit.totalTime, break: 1, cicles: 1 });
                    return;
                }

                const studyTime = Math.floor(edit.totalTime / 5);
                const breakTime = Math.floor(studyTime/5);
                const cycles = Math.floor(edit.totalTime / (studyTime + breakTime));

                setEdit({ ...edit, study: studyTime, break: breakTime, cicles: cycles });
            }
        }
    }

    const editPomodoto = () => {
        if (edit.study < 1 || edit.break < 1 || edit.cicles < 1) NewSwal.fire({icon: 'error', title: 'Error', text: 'All fields must be greater than 0'});
        else {
            if (socketData.inShare) socket.emit('edit pomodoro', { study: edit.study*60, breakTime: edit.break*60, cicles: edit.cicles });
            else editSettingsPomodoro(edit.study*60, edit.break*60, edit.cicles);
            resetPopUp();
        }
    }

    return (
        <div className='d-flex flex-column w-100'>
            <div className='row m-3'>
                <div className='col-md-6 col-12'>
                    <label htmlFor="study" className='text-center'>Study Time</label>
                    <input type="number" id="study" className='form-control'
                    placeholder='Study Time in minutes'
                    value={edit.study}
                    onChange={(e) => setEdit({ ...edit, study: Number(e.target.value) })}
                    min={1}
                    onKeyDown={(e) => handleEdit(e, 1)} />
                </div>

                <div className='col-md-6 col-12'>
                    <label htmlFor="break" className='text-center'>Break Time</label>
                    <input type="number" id="break" className='form-control'
                    placeholder='Break Time in minutes'
                    value={edit.break}
                    onChange={(e) => setEdit({ ...edit, break: Number(e.target.value) })}
                    min={1}
                    onKeyDown={(e) => handleEdit(e, 2)} />
                </div>
            </div>

            <div className='row m-3'>
                <div className='col-md-6 col-12'>
                    <label htmlFor="cicles" className='text-center'>Cicles</label>
                    <input type="number" id="cicles" className='form-control'
                    placeholder='Cicles'
                    value={edit.cicles}
                    onChange={(e) => setEdit({ ...edit, cicles: Number(e.target.value) })}
                    min={1}
                    onKeyDown={(e) => handleEdit(e, 3)} />
                </div>

                <div className='col-md-6 col-12'>
                    <label htmlFor="totalTime" className='text-center'>Total Time</label>
                    <input type="number" id="totalTime" className='form-control'
                    placeholder='Total Time in minutes'
                    value={edit.totalTime}
                    onChange={(e) => setEdit({ ...edit, totalTime: Number(e.target.value) })}
                    min={1}
                    onKeyDown={(e) => handleEdit(e, 4)} />
                </div>
            </div>
            
            <div className='row m-3 d-flex justify-content-center'>
                <div className='col-6 m-0 ps-0'>
                    <Button text='save' aria-label='save' onClick={editPomodoto} />
                </div>
            </div>
        </div>
    );
}

export default EditPomodoro;