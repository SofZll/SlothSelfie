import React, { useState } from 'react';

import { NewSwal } from '../../utils/swalUtils';
import { Pen, Trash2 } from 'lucide-react';

import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

import { useCalendar } from '../../contexts/CalendarContext';
import { usePomodoro } from '../../contexts/PomodoroContext';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout'; 
import PopUpPlanPomodoro from '../../components/PopUpPlanPomodoro';


const FormPomodoro = () => {

    const { selected, setSelected, resetSelected } = useCalendar();
    const { plannedPomodori, setPlannedPomodori, settingsPomodoro, resetSettingsPomodoro } = usePomodoro();
    const [deletePopUp, setDeletePopUp] = useState(false);

    const navigate = useNavigate();

    const goToPomodoro = () => {
        const p = plannedPomodori.find(p => p._id === settingsPomodoro._id);
        if (p) navigate(`/pomodoro/${p._id}`);

    }

    const deletePomodoro = async () => {
        const response = await apiService(`/pomodoro/${settingsPomodoro._id}`, 'DELETE');
        if (response.success) {
            Swal.fire({ title: 'Success', icon: 'success', text: 'Pomodoro deleted successfully', customClass: { confirmButton: 'button-alert' } });
            setPlannedPomodori(plannedPomodori.filter(p => p._id !== settingsPomodoro._id));
        } else Swal.fire({ title: 'Error', icon: 'error', text: 'Error deleting pomodoro', customClass: { confirmButton: 'button-alert' } });

        setDeletePopUp(false);
        resetSettingsPomodoro();
        resetSelected();
    }
    
    return (
        <div className='d-flex w-100 justify-content-center align-items-center position-relative  overflow-x-hidden'>
            {selected.edit ? (
                <PopUpPlanPomodoro edit={true} />
            ) : (
                <div className='d-flex flex-column align-items-center'>
                    <div className='fs-5 fw-bold text-center sloth-blue'>Planned {settingsPomodoro.title}</div>
                    <div className='d-flex flex-column mt-3'>
                        <div className='d-flex fst-italic pb-2'> Study Time: {settingsPomodoro.studyTime/60} min</div>
                        <div className='d-flex fst-italic pb-2'> Break Time: {settingsPomodoro.breakTime/60} min</div>
                        <div className='d-flex fst-italic pb-2'> Cycles: {settingsPomodoro.cycles}</div>
                        <div className='d-flex fst-italic'> Deadline:</div>
                        <div className='d-flex w-100 fst-italic justify-content-center pt-1 pb-3'> {new Date(settingsPomodoro.deadline).toLocaleDateString('en-CA')}</div>
                    </div>
                    
                    <div className='d-flex align-items-center justify-content-center'>
                        <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => goToPomodoro()}>
                            start
                        </button>
                    </div>

                    <button className='btn position-absolute bottom-0 end-0 m-0' onClick={() => setSelected({ ...selected, edit: true })}>
                        <Pen size='20' color='#244476' strokeWidth='1.5' />
                    </button>
                </div>
            )}

            <button className='btn position-absolute bottom-0 start-0 m-0' onClick={() => setDeletePopUp(true)}>
                <Trash2 size='20' color='#244476' strokeWidth='1.5' />
            </button>

            {deletePopUp && (
                <DeletePopUpLayout handleDelete={() => deletePomodoro()} handleClose={() => setDeletePopUp(false)}>
                    <div className='d-flex flex-column text-start'>
                        Are you sure you want to delete this pomodoro?
                    </div>

                    <div className='fs-5 fw-bold text-center'>Planned {settingsPomodoro.title}</div>

                    <div className='d-flex flex-column mt-3'>
                        <div className='d-flex fst-italic'> Total Study Time: {settingsPomodoro.studyTime * settingsPomodoro.cycles/60} min</div>
                        <div className='d-flex fst-italic'> Deadline:</div>
                        <div className='d-flex fst-italic text-center pt-1'>{new Date(settingsPomodoro.deadline).toLocaleDateString('en-CA')}</div>
                    </div>
                </DeletePopUpLayout>
            )}

        </div>
    )
}

export default FormPomodoro;
