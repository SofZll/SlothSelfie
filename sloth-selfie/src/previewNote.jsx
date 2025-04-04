import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';

import NoteCard from './NoteCard';
import './styles/Previews.css';

import { apiService } from './services/apiService';
import { useNote } from "./contexts/NoteContext";
import { AuthContext } from './contexts/AuthContext';

//TODO METTI COLORI DI NOTE IN BASE A CATEGORIE, Visualizza i task

const  PreviewNote = ({ viewType }) => {
    const navigate = useNavigate();
    const { notes, setNotes } = useNote();
    const { user } = React.useContext(AuthContext);

    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    const fetchNotes = async () => {
        const response = await apiService('/notes', 'GET');
        if (response) setNotes(response);
    };

    const sortNotes = (notes) => {
        const sortedNotes = [...notes].sort((a, b) => {
            const dateA = new Date(a.lastModified || a.createdAt);
            const dateB = new Date(b.lastModified || b.createdAt);
            return dateB - dateA;
        });

        if (viewType === "all") setNotes(sortedNotes);
        else if (viewType === "latest") setNotes(sortedNotes.length > 0 ? [sortedNotes[0]] : []);
    };




    useEffect(() => {
        if (user) {
            fetchNotes();
            sortNotes(notes);
        }
    }, [user]);

    const renderNotes = () => {
        return notes.length > 0 ? (
            notes.map((note) => (
                <div key={note._id} className="event-card note-border-yellow">
                    <NoteCard note={note} setNotes={setNotes} isPreview={true} />
                </div>
            ))
        ) : (
            <div className="div-postit">
                <h2>No notes yet!</h2>
            </div>
        );
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

