import React, { useState } from 'react';

import { useNote } from '../../contexts/NoteContext';
import MainLayout from '../../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';

import { MoveLeft, Lock, LockOpen, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const Note = () => {
    const { note, setNote, resetNote } = useNote();
    const [openShare, setOpenShare] = useState(false);
    const navigate = useNavigate();

    const back = () => {
        resetNote();
        navigate('../notes');
    }

    const completeTask = async (task) => {
        const response = await apiService(`/task/complete/${task._id}`, 'PUT');
        if (response.success) setNote({ ...note, tasks: note.tasks.map(t => t._id === task._id ? response.task : t) });
    }

    return (
        <MainLayout>
            <div className='d-flex flex-column w-100 h-100 py-5 m-md-3 overflow-auto'>

                <div className='d-flex w-100 justify-content-between align-items-center mt-3 mt-md-5'>
                    <h1 className='sloth-blue mx-3'>{note.title}</h1>
                    <button className='btn' onClick={() => back()}>
                        <MoveLeft size={30} color='#244476' strokeWidth={1.75} />
                    </button>
                </div>

                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex mx-4 my-2 sloth-blue fst-italic'>
                        {note.user}
                    </div>

                    {note.categoty !== '' && (
                        <div className='d-flex mx-4 my-2 sloth-blue'>
                            {note.category}
                        </div>
                    )}
                </div>

                {note.content.length > 0 && (
                    <div className='d-flex flex-column m-3 border rounded p-3 text-break' style={{ maxHeight: '300px' }}>
                        <div className='overflow-y-auto'>
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {note.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {note.tasks.length > 0 && (
                    <div className='row d-flex m-3 border rounded p-3' style={{ maxHeight: '300px' }}>
                        {note.tasks.map((task, index) => (
                            <div key={index} className='col-md-6 col-12'>
                                <div className=' d-flex justify-content-between align-items-center rounded shadow p-3 my-2'>
                                    <div className='d-flex align-items-center'>
                                        <input type='checkbox' checked={task.completed} onChange={() => completeTask(task)} />
                                        <div className='ps-2'>{task.title}</div>
                                    </div>
                                    {task.deadline && (
                                        <div>
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {note.noteAccess === 'shared' ? (
                    <div className='d-flex flex-column m-3 border rounded p-3 text-break' style={{ maxHeight: '300px' }}>
                        <div className='d-flex justify-content-between align-items-center opacity-50'>

                            <button className='btn p-1' onClick={() => setOpenShare(!openShare)}>
                                {openShare ? (
                                    <ChevronUp size={20} strokeWidth={1.5} />
                                ) : (
                                    <ChevronDown size={20} strokeWidth={1.5} />
                                )}
                            </button>
                            
                            <div className='d-flex w-auto'>
                                {note.noteAccess}
                                <div className='b-inline-block mx-1'>
                                    <KeyRound size={20} />
                                </div>
                            </div>

                        </div>

                        {openShare && (
                            <>
                            {note.sharedWith.length > 0 && (
                                <div className='row p-1'>
                                    {note.sharedWith.map((user, index) => (
                                        <div key={index} className='col-auto'>
                                            <div className='d-flex text-center rounded outline-sloth-blue sloth-blue p-2 my-2'>
                                                {user}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            </>
                        )}
                    </div>
                ) : (

                    <div className='d-flex justify-content-end align-items-center m-3 opacity-50'>
                        {note.noteAccess}
                        <div className='b-inline-block mx-1'>
                            {note.noteAccess === 'private' && (
                                <Lock size={20} />
                            )}
                            
                            {note.noteAccess === 'public' && (
                                <LockOpen size={20} />
                            )}
                        </div>
                    </div> 
                )}


                <div className='d-flex justify-content-end align-items-center m-3 opacity-50'>
                    <div className='b-inline-block mx-1'>
                        Created at: {new Date(note.createDate).toLocaleDateString()}
                    </div>
                    <div className='b-inline-block mx-1'>
                        Updated at: {new Date(note.updateDate).toLocaleDateString()}
                    </div>
                </div>


            </div>

        </MainLayout>
    );
}

export default Note;