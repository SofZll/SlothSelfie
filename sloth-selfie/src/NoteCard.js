import React, { useState } from 'react';
import './css/App.css';

function NoteCard({ note, onEdit, onDelete, onDuplicate, onCopy, index, clickedButton }) {

    const [isExpanded, setIsExpanded] = useState(false);  // State to manage the note content expansion
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <small>{note.category}</small>
       {/* Note content: if expanded show all the note text*/}
       <p onClick={toggleExpand} style={{ cursor: 'pointer' }}>
        {isExpanded ? note.content : note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')}
      </p>
      <small>{note.date.toLocaleString()}</small>
      <div className="note-buttons">
      <button
        className={`btn btn-edit ${clickedButton === 'edit' + index ? 'active' : ''}`}
          onClick={() => onEdit(index)}
        >
        Edit
        </button>
        <button
          className={`btn btn-delete ${clickedButton === 'delete' + index ? 'active' : ''}`}
          onClick={() => onDelete(index)}
          >
          Delete
          </button>

        <button
          className={`btn btn-duplicate ${clickedButton === 'duplicate' + index ? 'active' : ''}`}
          onClick={() => onDuplicate(index)}
        >
          Duplicate
        </button>
        <button
          className={`btn ${clickedButton === 'copy' + index ? 'active' : ''}`}
          onClick={() => onCopy(note.content)}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default NoteCard;