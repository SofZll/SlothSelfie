import React, { useState } from 'react';

import { X, SquareSigma, Wand, Hourglass } from 'lucide-react';
import Swal from 'sweetalert2';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { Button } from '../../components/Button';

const PopUpPomodoro = () => {

    const { popUp, setPopUp } = usePomodoro();
    const { editSettingsPomodoro } = usePomodoro();
    const [edit, setEdit] = useState({
        totalTime: 0,
        cicles: 0,
        study: 0,
        break: 0
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
        if (edit.study <= 1 || edit.break <= 1 || edit.cicles <= 1) Swal.fire({icon: 'error', title: 'Error', text: 'All fields must be greater than 1'});
        else editSettingsPomodoro(edit.study, edit.break, edit.cicles);
    }

    return (
        <div className='d-flex flex-column w-75 bg-white rounded p-3 position-fixed top-50 start-50 translate-middle pop-up shadow-lg'>
            <div className='d-flex justify-content-end'>
                <button className='btn btn-light' onClick={() => setPopUp({ ...popUp, open: false })}>
                    <X size={24} />
                </button>
            </div>

            {popUp.edit && (  
                <div className='d-flex flex-column w-100'>
                    <div className='row>'>
                        <div className='col-md-6 col-12'>
                            <label htmlFor="study" className='text-center'>Study Time</label>
                            <input type="number" id="study" className='form-control'
                            placeholder='Study Time in minutes'
                            value={edit.study}
                            onChange={(e) => setEdit({ ...edit, study: e.target.value })}
                            min={1}
                            onKeyDown={(e) => handleEdit(e, 1)} />
                        </div>

                        <div className='col-md-6 col-12'>
                            <label htmlFor="break" className='text-center'>Break Time</label>
                            <input type="number" id="break" className='form-control'
                            placeholder='Break Time in minutes'
                            value={edit.break}
                            onChange={(e) => setEdit({ ...edit, break: e.target.value })}
                            min={1}
                            onKeyDown={(e) => handleEdit(e, 2)} />
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-md-6 col-12'>
                            <label htmlFor="cicles" className='text-center'>Cicles</label>
                            <input type="number" id="cicles" className='form-control'
                            placeholder='Cicles'
                            value={edit.cicles}
                            onChange={(e) => setEdit({ ...edit, cicles: e.target.value })}
                            min={1}
                            onKeyDown={(e) => handleEdit(e, 3)} />
                        </div>

                        <div className='col-md-6 col-12'>
                            <label htmlFor="totalTime" className='text-center'>Total Time</label>
                            <input type="number" id="totalTime" className='form-control'
                            placeholder='Total Time in minutes'
                            value={edit.totalTime}
                            onChange={(e) => setEdit({ ...edit, totalTime: e.target.value })}
                            min={1}
                            onKeyDown={(e) => handleEdit(e, 4)} />
                        </div>
                    </div>
                    <button className='btn btn-main' onClick={() => editPomodoto()}> save </button>
                </div>
            )}      
            

            
        </div>
    )
}

export default PopUpPomodoro;