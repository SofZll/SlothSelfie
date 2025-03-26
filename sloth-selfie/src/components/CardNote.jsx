import React from 'react';

import { useNote } from '../contexts/NoteContext';

const CardNote = ({ Note }) => {

    return (
        <div className='d-flex flex-column w-100 align-items-center border rounded shadow-sm p-md-3 p-1 position-relative'>
            <div className='row'>
                <div className='col text-break fw-bold'>
                    {Note.title}
                </div>
            </div>
            <div className='row'>
                <div className='col fst-italic'>
                    {Note.user.username}
                </div>
            </div>

            {Note.content.length > 0 && (
                <div className='row'>
                    <div className='col col-12 border'>
                        {Note.content.length > 100 ? Note.content.slice(0, 100) + '...' : Note.content}
                    </div>
                </div>
            )}
            
            {Note.tasks.length > 0 && (
                <div className='row'>
                    <div className='col col-12 border'>
                        {Note.tasks.map((task, index) => (
                            <div key={index} className='d-flex flex-row justify-content-between shadow-sm'>
                                <div className='fst-italic'>
                                    <input type='checkbox' checked={task.completed} />
                                    {task.title}
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

            
                

        </div>
    );
}

export default CardNote;