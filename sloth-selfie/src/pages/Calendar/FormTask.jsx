import React, { useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';

const FormTask = () => {

    const { task, setTask, tasks, setTasks, resetTask } = useTask();
    const { resetSelected, setConditionsMet, conditionsMet, setDeletePopUp, deletePopUp } = useCalendar();

    const handleSubmit = async () => {
        const response = await apiService(`/task/${task._id}`, 'PUT', task);

        if (response.success) {
            NewSwal.fire({ title: 'Task edited', icon: 'success', text: 'Task edited successfully'});
            setTasks(tasks.map(tsk => tsk._id === task._id ? task : tsk));
            resetTask();
        } else NewSwal.fire({ title: 'Error editing task', icon: 'error', text: response.message});

        resetSelected();
    }

    const deleteTask = async () => {
        setDeletePopUp(false);
        const response = await apiService(`/task/${deletePopUp.toShow._id}`, 'DELETE');
        if (response.success) {
            NewSwal.fire({ title: 'Task deleted', icon: 'success', text: 'Task deleted successfully'});
            setTasks(tasks.filter(tsk => tsk._id !== deletePopUp.toShow._id));
        } else NewSwal.fire({ title: 'Error deleting task', icon: 'error', text: response.message});
        setDeletePopUp({ toCall: false, type: '', show: false, toShow: {} });
        resetSelected();
    }

    const openDeletePopUp = () => {
        setDeletePopUp({ ...deletePopUp, toShow: task, type: 'task', show: true });
        resetTask();
    }

    useEffect(() => {
        if (task.title) setConditionsMet(true);
        else setConditionsMet(false);
    }, [task.title]);

    useEffect(() => {
        if (deletePopUp.toCall && deletePopUp.type === 'task') {
            deleteTask();
        }
    }, [deletePopUp.toCall]);


    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Task title'
                        value={task.title}
                        onChange={(e) => setTask({...task, title: e.target.value})}
                        required />
                </div>
                <div className='col-6'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input
                        type='date' className='form-control' id='deadline'
                        value={new Date(task.deadline).toISOString().split('T')[0]}
                        onChange={(e) => setTask({...task, deadline: new Date(e.target.value).toISOString()})}
                        required />
                </div>
            </div>

            <div className='row d-flex justify-content-center py-2'>
                <div className='col col-auto form-check'>
                    <input
                        className='form-check-input' type='checkbox' role='switch' id='completed'
                        checked={task.completed}
                        onChange={(e) => setTask({...task, completed: e.target.checked})} />
                    <label className='form-check-label' htmlFor='completed'>Completed</label>
                </div>
            </div>
            
            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' aria-label='edit' className='btn-main rounded shadow-sm mt-4'  disabled={!conditionsMet} onClick={() => handleSubmit()}>edit</button>
                <button type='button' aria-label='delete' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => openDeletePopUp()}>delete</button>
            </div>

        </div>
    )
}

export default FormTask;