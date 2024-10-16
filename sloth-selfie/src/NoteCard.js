import React, { useState } from 'react';
import { marked } from 'marked';

function NoteCard({ note, onEdit, onDelete, onDuplicate, onCopy, index, clickedButton }) {

    const [isExpanded, setIsExpanded] = useState(false);  // State to manage the note content expansion
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    marked.setOptions({
      breaks: true,  // Se desideri che le nuove linee vengano rispettate
    });

    // Convert the note content to HTML
    function getMarkdownContent (content) {
      return marked(content);
    };

    console.log('Note content:', note.content);
    console.log('Note content (HTML):', getMarkdownContent(note.content));
    
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <small>{note.category}</small><br/><br/>
       {/* Note content: if expanded show all the note text*/}
       <div
          onClick={toggleExpand}
          style={{ cursor: 'pointer' }}
          dangerouslySetInnerHTML={{
            __html: isExpanded
              ? marked(note.content)
              : marked(note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')),
          }}
        />
      <br/>
      <small>Created: {new Date(note.createDate).toLocaleString()}</small><br/>
      <small>Last Modified: {new Date(note.updateDate).toLocaleString()}</small><br/>
      <div className="notes-buttons">
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