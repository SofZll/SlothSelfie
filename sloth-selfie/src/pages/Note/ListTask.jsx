import React from "react";

import { useTask } from '../../contexts/TaskContext';
import { useNote } from '../../contexts/NoteContext';

import { X, Plus } from 'lucide-react';

const ListTask = () => {

    const { task, setTask, resetTask } = useTask();
    const { note, setNote, selected } = useNote();

    const setDeadline = (date) => {
        const d = new Date(date);
        d.setHours(23, 59, 59);
        setTask({...task, ['deadline']: d});
    }

    const addTask = async () => {
        if (!task.title) return;

        if (selected.add) setNote({...note, tasks: [...note.tasks, task]});
        else setNote({...note, addedTasks: [...note.addedTasks, task]});
        resetTask();
    }

    const deleteExistingTask = (t) => {
        setNote({ ...note, deletedTasks: [...note.deletedTasks, t], tasks: note.tasks.filter(tk => tk._id !== t._id) });
    }

    const deleteLocalTask = (t) => {
        setNote({ ...note, addedTasks: note.addedTasks.filter(tk => tk._id !== t._id) });
    }

    const completeLocalTask = (t) => {
        setNote({...note, addedTasks: note.addedTasks.map(tk => tk._id === t._id ? { ...t, completed: !t.completed } : tk )});
    }

    const completeExistingTask = (t) => {
        setNote({...note, tasks: note.tasks.map(tk => tk._id === t._id ? { ...t, completed: !t.completed } : tk )});
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') addTask();
    }

    return (
        <div className='d-flex flex-column w-100 p-2 p-0 border rounded mt-2'>
            <form className='row d-flex align-items-center' onKeyDown={handleKeyDown}>
                <div className='col-6'>
                    <label htmlFor='tasks' className='form-label'>Title</label>
                    <input type='text' className='form-control' id='tasks'
                    placeholder='Task Title'
                    value={task.title}
                    onChange={(e) => setTask({...task, ['title']: e.target.value})}/>
                </div>
                <div className='col-4'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input type='date' className='form-control' id='deadline'
                    value={task.deadline ? (new Date(task.deadline)).toISOString().split('T')[0] : ''}
                    onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div className='col-2'>
                    <button type='button' className='btn p-0' onClick={() => addTask()}>
                        <Plus size={20} color='#555B6E' strokeWidth={1.75} />
                    </button>
                </div>
            </form>

            {note.addedTasks.length > 0 && (
                <div className='d-flex flex-column w-100'>
                    {note.addedTasks.map((t, index) => (
                        <div key={index} className='d-flex flex-row w-100 p-1 align-items-center justify-content-between shadow-sm'>
                            <div className='d-flex align-items-center fst-italic'>
                                <input type='checkbox' checked={t.completed} onChange={() => completeLocalTask(t)} />
                                <div className='p-1'>{t.title}</div>
                            </div>
                            {t.deadline && (
                                <div>
                                    {new Date(t.deadline).toLocaleDateString()}
                                </div>
                            )}
                            <div>
                                <button type='button' className='btn p-0' onClick={() => deleteLocalTask(t)}>
                                    <X size={20} color='#555B6E' strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {note.tasks.length > 0 && (
                <div className='d-flex flex-column w-100'>
                    {note.tasks.map((t, index) => (
                        <div key={index} className='d-flex flex-row w-100 p-1 align-items-center justify-content-between shadow-sm'>
                            <div className='d-flex align-items-center fst-italic'>
                                <input type='checkbox' checked={t.completed} onChange={() => completeExistingTask(t)} />
                                <div className='p-1'>{t.title}</div>
                            </div>
                            {t.deadline && (
                                <div>
                                    {new Date(t.deadline).toLocaleDateString()}
                                </div>
                            )}
                            <div>
                                <button type='button' className='btn p-0' onClick={() => deleteExistingTask(t)}>
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