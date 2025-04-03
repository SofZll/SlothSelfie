import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotes } from "./NotesUtils";
import NoteCard from './NoteCard';
import './styles/Previews.css';

//TODO METTI COLORI DI NOTE IN BASE A CATEGORIE

const  PreviewNote = ({ viewType, userLogged }) => {
    const navigate = useNavigate();
    const [initialNotes, setInitialNotes] = useState([]);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    // Function to handle login/logout state
    useEffect(() => {
        if (userLogged) {
            setIsUserLoggedIn(true);
        } else {
            setIsUserLoggedIn(false);
            setInitialNotes([]); // Reset notes if the user is logged out
        }
    }, [userLogged]);

    useEffect(() => {
        fetchNotes().then((notes) => {
            setInitialNotes(notes);
        });
    }, [isUserLoggedIn]);

    const sortedNotes = [...initialNotes]
    .sort((a, b) => new Date(b.lastModified || b.createdAt) - new Date(a.lastModified || a.createdAt))
    .slice(0, 10); // Get the latest 10 notes
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

