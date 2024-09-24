import React, { useState } from 'react';

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
      <small>Created: {new Date(note.createDate).toLocaleString()}</small>
      <small>Last Modified: {new Date(note.updateDate).toLocaleString()}</small>
      <div className="note-buttons">
      <button
        className={`btn2 btn-edit ${clickedButton === 'edit' + index ? 'active' : ''}`}
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
          className={`btn2 btn-duplicate ${clickedButton === 'duplicate' + index ? 'active' : ''}`}
          onClick={() => onDuplicate(index)}
        >
          Duplicate
        </button>
        <button
          className={`btn btn-copy ${clickedButton === 'copy' + index ? 'active' : ''}`}
          onClick={() => onCopy(note.content)}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default NoteCard;