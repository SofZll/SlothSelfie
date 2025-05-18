import React, { useState, useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';
import { Pen, Trash2 } from 'lucide-react';

import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

import { useCalendar } from '../../contexts/CalendarContext';
import { usePomodoro } from '../../contexts/PomodoroContext';
import PopUpPlanPomodoro from '../../components/PopUpPlanPomodoro';


const FormPomodoro = () => {

    const { selected, setSelected, resetSelected, deletePopUp, setDeletePopUp } = useCalendar();
    const { plannedPomodori, setPlannedPomodori, settingsPomodoro, resetSettingsPomodoro } = usePomodoro();

    const navigate = useNavigate();

    const goToPomodoro = () => {
        const p = plannedPomodori.find(p => p._id === settingsPomodoro._id);
        if (p) navigate(`/pomodoro/${p._id}`);

    }

    const deletePomodoro = async () => {
        const response = await apiService(`/pomodoro/${deletePopUp.toShow._id}`, 'DELETE');
        if (response.success) {
            NewSwal({ title: 'Success', icon: 'success', text: 'Pomodoro deleted successfully'});
            setPlannedPomodori(plannedPomodori.filter(p => p._id !== deletePopUp.toShow._id));
        } else NewSwal({ title: 'Error', icon: 'error', text: 'Error deleting pomodoro'});

        setDeletePopUp({ toCall: false, type: '', show: false, toShow: {} });
        resetSelected();
    }

    const openDeletePopUp = () => {
        setDeletePopUp({ ...deletePopUp, toShow: settingsPomodoro, type: 'pomodoro', show: true });
        resetSettingsPomodoro();
    }

    useEffect(() => {
        if (deletePopUp.toCall && deletePopUp.type === 'pomodoro') {
            deletePomodoro();
        }
    }, [deletePopUp.toCall]);
    
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
                        <button type='button' aria-label='start' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => goToPomodoro()}>
                            start
                        </button>
                    </div>

                    <button type='button' aria-label='edit' title='Edit' className='btn position-absolute bottom-0 end-0 m-0' onClick={() => setSelected({ ...selected, edit: true })}>
                        <Pen size='20' color='#244476' strokeWidth='1.5' />
                    </button>
                </div>
            )}

            <button type='button' aria-label='edit' title='Delete' className='btn position-absolute bottom-0 start-0 m-0' onClick={() => openDeletePopUp()}>
                <Trash2 size='20' color='#244476' strokeWidth='1.5' />
            </button>

        </div>
    )
}

export default FormPomodoro;
