import React, { useState } from 'react';

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import CopyButton from './CopyButton';
import { Pen, Trash2, Layers2 } from 'lucide-react';
import Swal from 'sweetalert2';

import { useNote } from '../contexts/NoteContext';
import { apiService } from '../services/apiService';

const CardNote = ({ Note }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const previewContent = Note.content.length > 100 ? Note.content.substring(0, 100) : Note.content;

    const { selected, setSelected, setNote, notes, setNotes } = useNote();

    const selectNote = () => {
        setNote(Note);
        if (Note.tasks) setNote({ ...Note, tasks: Note.tasks.map(t => ({ ...t, deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : null })), addedTasks: [], deletedTasks: [] });
        setSelected({ ...selected, edit: true, add: false, popUp: true });
    }

    const completeTask = async (task) => {
        const response = await apiService(`/task/complete/${task._id}`, 'PUT');
        if (response) setNotes(notes.map(n => n._id === Note._id ? { ...Note, tasks: Note.tasks.map(t => t._id === task._id ? response : t) } : n));
    }

    const deleteNote = async () => {
        const response = await apiService(`/note/${Note._id}`, 'DELETE');
        if (response) {
            Swal.fire({ title: 'Note deleted', icon: 'success', text: 'Note deleted successfully', customClass: { confirmButton: 'button-alert' } });
            setNotes(notes.filter(n => n._id !== Note._id));
        } else Swal.fire({ title: 'Error', icon: 'error', text: 'Error deleting note', customClass: { confirmButton: 'button-alert' } });
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
        if (response) {
            Swal.fire({ title: 'Note duplicated', icon: 'success', text: 'Note duplicated successfully', customClass: { confirmButton: 'button-alert' } });
            setNotes([...notes, response]);
        } else Swal.fire({ title: 'Error', icon: 'error', text: 'Error duplicating note', customClass: { confirmButton: 'button-alert' } });
    }

    return (
        <div className='d-flex flex-column w-100 h-100 align-items-center border rounded shadow-sm p-md-3 p-1 position-relative'>
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
                    <div className='col col-12 border rounded p-2'>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {isExpanded ? Note.content : previewContent}
                        </ReactMarkdown>
                        {isExpanded && (
                            <button className="btn" onClick={() => setIsExpanded(false)}>
                                ...
                            </button>
                        )}
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
                        Created: {new Date(Note.createDate).toLocaleDateString()}
                    </div>
                    <div>
                        Last Modified: {new Date(Note.updateDate).toLocaleDateString()}
                    </div>
                </div>
            </div> 

            <button className='btn position-absolute top-0 end-0' onClick={() => selectNote()}>
                <Pen size={20} color='#244476' strokeWidth={1.5} />
            </button>

            <button className='btn position-absolute bottom-0 end-0' onClick={() => deleteNote()}>
                <Trash2 size={23} color='#244476' strokeWidth={1.5} />
            </button>

            <button className='btn position-absolute bottom-0 start-0' onClick={() => duplicateNote()}>
                <Layers2 size={23} color='#244476' strokeWidth={1.6} />
            </button>

        </div>
    );
}

export default CardNote;