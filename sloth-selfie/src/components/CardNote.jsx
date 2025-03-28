import React, { useState } from 'react';

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import CopyButton from './CopyButton';
import { Copy } from 'lucide-react';

const CardNote = ({ Note }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const previewContent = Note.content.length > 100 ? Note.content.substring(0, 100) : Note.content;

    return (
        <div className='d-flex flex-column w-100 h-100 align-items-center border rounded shadow-sm p-md-3 p-1'>
            <div className='row w-100'>
                <div className='col'>
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
                                    <input type='checkbox' checked={task.completed} />
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

            <div className='row w-100 mt-2'>
                <div className='col opacity-50 fs-6'>
                    <div>
                        Created: {new Date(Note.createDate).toLocaleDateString()}
                    </div>
                    <div>
                        Last Modified: {new Date(Note.updateDate).toLocaleDateString()}
                    </div>
                </div>
            </div> 

        </div>
    );
}

export default CardNote;