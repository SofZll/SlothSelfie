import React from "react";

import { useTask } from '../../contexts/TaskContext';

import { X, Plus } from 'lucide-react';

const ListTask = () => {

    const { task, setTask, resetTask, localTask, setLocalTask } = useTask();

    const addTask = async () => {
        setLocalTask([...localTask, task]);
        resetTask();
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') addTask();
    }

    return (
        <div className='d-flex flex-column w-100 p-md-2 p-0 border rounded mt-2'>
            <form className='row d-flex align-items-center' onKeyDown={handleKeyDown}>
                <div className='col-6'>
                    <label htmlFor='tasks' className='form-label'>Title</label>
                    <input type='text' className='form-control' id='tasks'
                    placeholder='Task Title'
                    value={task.title}
                    onChange={(e) => setTask({...task, ['title']: e.target.value})}
                    required />
                </div>
                <div className='col-4'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input type='date' className='form-control' id='deadline'
                    value={task.deadline}
                    onChange={(e) => setTask({...task, ['deadline']: e.target.value})} />
                </div>
                <div className='col-2'>
                    <button type='button' className='btn p-0' onClick={() => addTask()}>
                        <Plus size={20} color='#555B6E' strokeWidth={1.75} />
                    </button>
                </div>
            </form>
            {localTask.length > 0 && (
                <div className='d-flex flex-column w-100'>
                    {localTask.map((task, index) => (
                        <div key={index} className='d-flex flex-row w-100 p-1 align-items-center justify-content-between shadow-sm'>
                            <div className='d-flex align-items-center fst-italic'>
                                <input type='checkbox' checked={task.completed} onChange={() => setLocalTask(localTask.map(t => t._id === task._id ? {...t, ['completed']: !t.completed} : t))} />
                                <div className='p-1'>{task.title}</div>
                            </div>
                            {task.deadline && (
                                <div>
                                    {new Date(task.deadline).toLocaleDateString()}
                                </div>
                            )}
                            <div>
                                <button type='button' className='btn p-0' onClick={() => setLocalTask(localTask.filter(t => t._id !== task._id))}>
                                    <X size={20} color='#555B6E' strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ListTask;