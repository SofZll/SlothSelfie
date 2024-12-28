import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotes } from "./NotesUtils";
import noteImage from './media/note.png';
import NoteCard from './NoteCard';
import './css/Notes.css';

function PreviewNote() {
    const navigate = useNavigate();
    const [initialNotes, setInitialNotes] = useState([]);

    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    useEffect(() => {
        fetchNotes().then((notes) => {
            setInitialNotes(notes);
        });
    }, []);

    return (
        <div className="inCard">
            <div className="notes-section">
                <p>Your Notes:</p>
                <div className="scrollable-list">
                    {Array.isArray(initialNotes) && initialNotes.length > 0 ? (
                        initialNotes.map((note) => {
                            return (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    setNotes={setInitialNotes}
                                    isPreview={true}
                                />
                            );
                        })
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

