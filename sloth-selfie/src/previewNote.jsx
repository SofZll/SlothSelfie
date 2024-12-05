import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { initialNotes } from './Notes';
import noteImage from './media/note.png';
import { marked } from 'marked';
import './css/Notes.css';

function PreviewNote() {
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);
    const longText = "Questo è un testo molto lungo che verrà troncato se supera un certo limite di caratteri. Quando clicchi sul pulsante 'Continua', potrai leggere il testo completo. Questa funzionalità è utile quando hai tanto contenuto da mostrare ma vuoi mantenere l'interfaccia pulita e ordinata.";

    const toggleText = () => {
        setIsExpanded(!isExpanded);
    };

    const limit = 100; // Limite di caratteri da visualizzare prima di troncare
    const truncatedText = longText.slice(0, limit) + '...';


    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    
    

    return (
        <div className="inCard">
            <div className="notes-section">
                <p>Your Notes:</p>
                <div className="scrollable-list">
                    {initialNotes.length > 0 ? (
                        initialNotes.map((note, index) => (
                            <div key={index} className="card-note mb-3"> {/* Bootstrap card */}
                                <div className="card-body">
                                    <h5>{note.title}</h5>
                                    <small>Author: {note.author}</small><br />
                                    <small>
                                        Access: {note.access.type === 'public' 
                                            ? 'Public' 
                                            : note.access.type === 'private' 
                                            ? 'Private' 
                                            : `Shared with: ${note.access.allowedUsers.join(', ')}`}
                                    </small>
                                    {/* Render note content or todo list */}
                                    {note.isTodo ? (
                                        <div className="card-text">
                                            <ul>
                                            {/* Render the tasks if the note contains a todo list */}
                                            {note.tasks && note.tasks.length > 0 ? (
                                                note.tasks.map((task, taskIndex) => (
                                                <li key={taskIndex}>
                                                    <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    readOnly
                                                    />
                                                    {task.completed ? <s>{task.text}</s> : task.text}
                                                    {task.deadline ? (
                                                    <small>
                                                        &nbsp; Deadline: {new Date(task.deadline).toLocaleDateString()}
                                                    </small>
                                                    ) : null}
                                                </li>
                                                ))
                                            ) : (
                                                <p>No tasks available</p>
                                            )}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="card-text">
                                            {/* Limiting note content to 200 characters, showing markdown */}
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: note.content.length > 200 
                                                        ? marked(note.content.substring(0, 200) + "...")
                                                        : marked(note.content)
                                                }}
                                            />
                                        </div>
                                    )}
                                    {/* Using d-flex and justify-content-between for proper alignment */}
                                    <div className="d-flex justify-content-between mt-3">
                                        <small className="text-muted">Category: {note.category}</small><br />
                                        <small className="text-muted">Created on: {new Date(note.createDate).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="div-postit">
                            <h2>No notes yet!</h2>
                            <img src={noteImage} alt="Note illustration" className="note-image" />
                        </div>
                    )}
                </div>
                <div className="divBtn">
                    <Link to="/notes" onClick={handleLinkClick('/notes')}>
                        <button className="btn btn-main">Manage Notes</button> {/* Bootstrap button */}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PreviewNote;

