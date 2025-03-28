import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotes } from "./NotesUtils";
import NoteCard from './NoteCard';
import './styles/Previews.css';

//TODO: CONTROLLA LO USER LOGGATO PER FARE FETCH CORRETTI

const  PreviewNote = ({ viewType }) => {
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

    const sortedNotes = [...initialNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestNote = sortedNotes.length > 0 ? [sortedNotes[0]] : [];

    const renderNotes = () => {
        switch (viewType) {
            case "latest":
                return latestNote.length > 0 ? (
                    latestNote.map((note) => (
                        <div key={note._id} className="event-card note-border-yellow">
                            <NoteCard note={note} setNotes={setInitialNotes} isPreview={true} />
                        </div>
                    ))
                ) : (
                    <div className="div-postit">
                        <h2>No notes yet!</h2>
                    </div>
                );

            case "all":
            default:
                return sortedNotes.length > 0 ? (
                    sortedNotes.map((note) => (
                        <div key={note._id} className="event-card note-border-yellow">
                            <NoteCard note={note} setNotes={setInitialNotes} isPreview={true} />
                        </div>
                    ))
                ) : (
                    <div className="div-postit">
                        <h2>No notes yet!</h2>
                    </div>
                );
        }
    };

    return (
        <div className="inCard">
            <div className="notes-section">
                <div className="scrollable-list">
                    {renderNotes()}
                </div>
                <div className="divBtn">
                    <Link to="/notes" onClick={handleLinkClick('/notes')}>
                        <button className="btn btn-main blue">Manage Notes</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PreviewNote;

