import React  from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';

const FormTask = () => {

    const { task, setTask, tasks, setTasks, resetTask } = useTask();
    const { resetSelected } = useCalendar();

    const handleSubmit = async () => {
        const response = await apiService(`/task/${task._id}`, 'PUT', task);

        if (response){
            Swal.fire({ title: 'Task edited', icon: 'success', text: 'Task edited successfully', customClass: { confirmButton: 'button-alert' } });
            setTasks(tasks.map(tsk => tsk._id === task._id ? task : tsk));
            resetTask();
        } else Swal.fire({ title: 'Error editing task', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });

        resetSelected();
    }

    const deleteTask = async () => {
        const response = await apiService(`/task/${task._id}`, 'DELETE');
        if (response){
            Swal.fire({ title: 'Task deleted', icon: 'success', text: 'Task deleted successfully', customClass: { confirmButton: 'button-alert' } });
            setTasks(tasks.filter(tsk => tsk._id !== task._id));
            resetTask();
        } else Swal.fire({ title: 'Error deleting task', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        resetSelected();
    }

    const exportTask = async () => {
            try {
                const response = await apiService(`/task/${task._id}/export`, 'GET');
        
                if (!response) throw new Error('Empty response from server');
        
                const blob = response;
    
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${task.title}.ics`;
                a.click();
        
                Swal.fire({
                    title: 'Task exported',
                    icon: 'success',
                    text: 'Task exported successfully',
                    customClass: { confirmButton: 'button-alert' }
                });
            } catch (err) {
                Swal.fire({
                    title: 'Error exporting task',
                    icon: 'error',
                    text: err.message || 'Unknown error',
                    customClass: { confirmButton: 'button-alert' }
                });
            }
        }

    return (
        <form className='d-flex flex-column w-100'>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Task title'
                        value={task.title}
                        onChange={(e) => setTask({...task, ['title']: e.target.value})}
                        required />
                </div>
                <div className='col-6'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input
                        type='date' className='form-control' id='deadline'
                        value={new Date(task.deadline).toISOString().split('T')[0]}
                        onChange={(e) => setTask({...task, ['deadline']: e.target.value})}
                        required />
                </div>
            </div>

            <div className='row d-flex justify-content-center py-2'>
                <div className='col col-auto form-check'>
                    <input
                        className='form-check-input' type='checkbox' role='switch' id='completed'
                        checked={task.completed}
                        onChange={(e) => setTask({...task, ['completed']: e.target.checked})} />
                    <label className='form-check-label' htmlFor='completed'>Completed</label>
                </div>
            </div>

            <div className='row py-2'>
                <div className='col-12'>
                    {/* Field for share TODO */}
                </div>
            </div>
            
            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' className='btn-main rounded shadow-sm mt-4' onClick={() => handleSubmit()}>edit</button>
                <>
                <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => deleteTask()}>delete</button>
                <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => exportTask()}>export</button>
                </>
            </div>

        </form>
    )
}

export default FormTask;