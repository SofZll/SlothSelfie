import React, { useState } from 'react';
import { marked } from 'marked';

function NoteCard({ note, onEdit, onDelete, onDuplicate, onCopy, index, clickedButton }) {

    const [isExpanded, setIsExpanded] = useState(false);  // State to manage the note content expansion
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    marked.setOptions({
      breaks: true,
    });

    // Convert the note content to HTML
    function getMarkdownContent (content) {
      if (content && content.trim()) 
        return marked(content);
    };

    //console.log('Note content:', note.content);
    //console.log('Note content (HTML):', getMarkdownContent(note.content));

    //console.log('Rendering NoteCard:', note);
    //console.log('Tasks:', note.tasks);
    
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <small>{note.category}</small><br/>
      <small>Author: {note.author}</small><br/>
      <small>
        Access: {note.access?.type === 'public' 
          ? 'Public' 
          : note.access?.type === 'private' 
          ? 'Private' 
          : `Shared with: ${note.access?.allowedUsers.join(', ')}`}
    </small>
    {/* Shows the todo list if it is one */}
    {note.isTodo ? (
      <ul>
        {note.tasks.map((task, taskIndex) => (
          <li key={taskIndex}>
            <input 
              type="checkbox" 
              checked={task.completed} 
            />
            {task.completed ? <s>{task.text}</s> : task.text}
            {task.deadline ? (
              <small>
                &nbsp; Deadline: {new Date(task.deadline).toLocaleDateString()}
              </small>
            ) : null}
          </li>
        ))}
      </ul>
    ) : (
      // Else shows the note content
      /* Note content: if expanded show all the note text*/
      <div
        onClick={toggleExpand}
        style={{ cursor: 'pointer' }}
        dangerouslySetInnerHTML={{
          __html: isExpanded
            ? marked(note.content)
            : marked(note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')),
        }}
      />
    )}
      <small>Created: {new Date(note.createDate).toLocaleString()}</small><br/>
      <small>Last Modified: {new Date(note.updateDate).toLocaleString()}</small><br/>
      <div className="notes-buttons">
        <div>
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
      </div>
      <div>
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
    </div>
  );
}

export default NoteCard;