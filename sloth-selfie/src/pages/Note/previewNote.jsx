import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';

import CardNote from "../../components/CardNote";
import FormNote from "../../pages/Note/FormNote";
import '../../styles/Previews.css';

import { apiService } from '../../services/apiService';
import { useNote } from "../../contexts/NoteContext";
import { AuthContext } from '../../contexts/AuthContext';


const  PreviewNote = ({ viewType }) => {
    const navigate = useNavigate();
    const { notes, setNotes } = useNote();
    const { user } = React.useContext(AuthContext);

    const [showForm, setShowForm] = useState(viewType === "add");

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
        if (response.success) setNotes(sortNotes(response.notes));
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
            }else if (viewType === "add" && notes.length > 0) {
                setNotes([]);
            }
        }
    }, [notes, viewType, setNotes]);

    useEffect(() => {
        if (viewType === "add") {
            setShowForm(true);
        } else {
            setShowForm(false);
        }
    }, [viewType]);

    const renderNotes = () => {    
        return (
            <>
                {showForm && (
                    <div className="event-card note-border-green">
                        <FormNote/>
                    </div>
                )}
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div key={note._id} className="event-card note-border-yellow">
                            <CardNote Note={note} />
                        </div>
                    ))
                ) : !showForm ? (
                    <div className="div-postit">
                        <h2>No notes yet!</h2>
                    </div>
                ) : null}
            </>
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

