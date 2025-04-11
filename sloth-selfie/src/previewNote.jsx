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
        if (response) {
            const limitedNotes = sortNotes(response); 
            setNotes(limitedNotes); // We keep the 10 most recent notes
            console.log("Fetched notes:", limitedNotes);
        }
    };

    const sortNotes = (notes) => {
        // Order from most recent
        const sortedNotes = [...notes].sort((a, b) => {
            const dateA = new Date(a.lastModified || a.createdAt);
            const dateB = new Date(b.lastModified || b.createdAt);
            return dateB - dateA;
        });
        // Limit to 10 most recent notes
        return sortedNotes.slice(0, 10);
    };

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user]);

    useEffect(() => {
        if (notes.length > 0) {
            const limitedNotes = notes.slice(0, 10); // Limit to 10 notes
            if (viewType === "all" && notes !== limitedNotes) {
                setNotes(limitedNotes);
            } else if (viewType === "latest" && (notes[0] !== limitedNotes[0] || notes.length > 1)) {
                setNotes([limitedNotes[0]]);
            }
        }
    }, [notes, viewType, setNotes]);


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

