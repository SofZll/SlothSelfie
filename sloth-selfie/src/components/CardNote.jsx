import React, { useState } from 'react';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import CopyButton from './CopyButton';
import { Pen, Trash2, Layers2, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';

import { useNote } from '../contexts/NoteContext';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import DeletePopUpLayout from '../layouts/DeletePopUpLayout';


const CardNote = ({ Note }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const previewContent = Note.content.length > 100 ? Note.content.substring(0, 100) : Note.content;

    const { setSelected, setNote, notes, setNotes, deletePopUp, setDeletePopUp } = useNote();
    const navigate = useNavigate();

    const selectNote = () => {
        
        if (Note.tasks) setNote({ ...Note, user: Note.user.username, sharedWith: Note.sharedWith.map(u => u.username ), tasks: Note.tasks.map(t => ({ ...t, deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : null })), addedTasks: [], deletedTasks: [] });
        else setNote({ ...Note, user: Note.user.username, sharedWith: Note.sharedWith.map(u => u.username) });
        setSelected({ edit: true, add: false, popUp: true });
    }

    const completeTask = async (task) => {
        const response = await apiService(`/task/complete/${task._id}`, 'PUT');
        if (response.success) setNotes(notes.map(n => n._id === Note._id ? { ...Note, tasks: Note.tasks.map(t => t._id === task._id ? response.task : t) } : n));
    }

    const deleteNote = async () => {
        const response = await apiService(`/note/${deletePopUp.note._id}`, 'DELETE');
        if (response.success) {
            NewSwal.fire({ title: 'Note deleted', icon: 'success', text: 'Note deleted successfully'});
            setNotes(notes.filter(n => n._id !== deletePopUp.note._id));
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message});

        setDeletePopUp({show: false, note: null});
    }

    const duplicateNote = async () => {
        const copyTasks = [];
        if (Note.tasks) {
            for (const task of Note.tasks) {
                copyTasks.push({ ...task, _id: null, 'completed': false });
            }
        }
        const copyNote = { ...Note, _id: null, title: `${Note.title} (copy)`, tasks: copyTasks };
        const response = await apiService('/note', 'POST', copyNote);
        if (response.success) {
            NewSwal.fire({ title: 'Note duplicated', icon: 'success', text: 'Note duplicated successfully'});
            setNotes([...notes, response.note]);
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: 'Error duplicating note'});
    }

    const openNote = () => {
        
        if (Note.tasks) setNote({ ...Note, user: Note.user.username, sharedWith: Note.sharedWith.map(u => u.username ), tasks: Note.tasks.map(t => ({ ...t, deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : null })), addedTasks: [], deletedTasks: [] });
        else setNote({ ...Note, user: Note.user.username, sharedWith: Note.sharedWith.map(u => u.username) });

        navigate(`/notes/${Note._id}`);
    }

    return (
        <div className='d-flex flex-column w-100 h-100 align-items-center border rounded shadow-sm position-relative'>
            <div className={`d-flex flex-column w-100 h-100 align-items-center p-md-3 p-1 border-bottom border-3 
                ${Note.category === 'study' && 'border-primary'} ${Note.category === 'work' && 'border-success'} ${Note.category === 'personal' && 'border-danger-subtle'} ${Note.category === 'other' && 'border-warning'}`}>
                <div className='row w-100'>
                    <div className='col-10'>
                        <CopyButton Note={Note} />
                    </div>
                </div>
                <div className='row w-100'>
                    <div className='col fst-italic'>
                        {Note.user.username}
                    </div>
                </div>

                {Note.content.length > 0 && (
                    <div className='row w-100 mt-3'>
                        <div className='col col-12 border rounded p-2 position-relative' style={{ maxHeight: '300px' }}>

                            <div className='d-flex justify-content-end w-100 bg-light position-absolute bottom-0 end-0'>

                                {Note.content.length > 100 && (
                                    <>
                                    {isExpanded ? (
                                        <button type='button' aria-label='Collapse' title='Collapse' className='btn btn-link p-0' onClick={() => setIsExpanded(false)}>
                                            <ChevronUp size={20} color='#244476' strokeWidth={1.5} />
                                        </button>
                                    ) : (
                                        <button type='button' aria-label='Expand' title='Expand' className='btn btn-link p-0' onClick={() => setIsExpanded(true)}>
                                            <ChevronDown size={20} color='#244476' strokeWidth={1.5} />
                                        </button>
                                    )}
                                    </>
                                )}
                            </div>

                            <div className='d-flex flex-column h-100 w-100 overflow-y-auto pb-3'>
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                    {isExpanded ? Note.content : previewContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
                
                {Note.tasks.length > 0 && (
                    <div className='row w-100 mt-3'>
                        <div className='col border'>
                            {Note.tasks.map((task, index) => (
                                <div key={index} className='d-flex flex-row justify-content-between my-1'>
                                    <div className='d-flex align-items-center fst-italic'>
                                        <input type='checkbox' checked={task.completed} onChange={() => completeTask(task)} />
                                        <div className='ps-1'>{task.title}</div>
                                    </div>
                                    {task.deadline && (
                                        <div>
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='row w-100 mt-2 mb-5'>
                    <div className='col opacity-50 fs-6'>
                        <div>
                            Created: {new Date(Note.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                            Last Modified: {new Date(Note.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div> 

                {!Note.isInProject && (
                    <button type='button' aria-label='Edit' title='Edit' className='btn position-absolute top-0 end-0' onClick={() => selectNote()}>
                        <Pen size={20} color='#244476' strokeWidth={1.6} />
                    </button>
                )}

                <div className='d-flex w-100 position-absolute justify-content-between bottom-0 start-0'>
                    <button type='button' aria-label='Maximize' title='Maximize' className='btn' onClick={() => openNote()}>
                        <Maximize2 size={20} color='#244476' strokeWidth={1.6} />
                    </button>

                    <div className='d-inline'>
                    {!Note.isInProject && (
                        <>
                            <button type='button' aria-label='Duplicate' title='Duplicate' className='btn' onClick={() => duplicateNote()}>
                                <Layers2 size={23} color='#244476' strokeWidth={1.6} />
                            </button>

                            <button type='button' aria-label='Delete' title='Delete' className='btn' onClick={() => setDeletePopUp({show: true, note: Note})}>
                                <Trash2 size={23} color='#244476' strokeWidth={1.6} />
                            </button>
                        </>
                        )}

                    </div>
                </div>

                {deletePopUp.show && deletePopUp.note && (
                    <DeletePopUpLayout handleDelete={() => deleteNote()} handleClose={() => setDeletePopUp({show: false, note: null})}>
                        <div className='d-flex flex-column text-start'>
                            Are you sure you want to delete this note?
                        </div>
                        <div className='d-flex flex-column'>
                            <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.note.title}</div>
                            <div className='text-start'>
                                <div className='d-inline-block pe-1'>by</div>
                                <div className='d-inline-block fst-italic' style={{ color: '#244476' }}>{deletePopUp.note.user.username}</div>
                            </div>
                        </div>
                    </DeletePopUpLayout>
                )}
            </div>
        </div>
    );
}

export default CardNote;