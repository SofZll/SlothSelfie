import React, { useState } from 'react';
import { marked } from 'marked';
import { toggleTaskCompletion } from './NotesUtils';

function NoteCard({ noteAuthor, note, setNotes, onEdit, onDelete, onDuplicate, onCopy, index, clickedButton }) {

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

  const setCompleted = async (indexTask) => {
    const updatedTask = await toggleTaskCompletion(indexTask, note);

    if (!updatedTask) {
      return;
    }

    console.log('updatedTask:', updatedTask);
    
    setNotes((prevNotes) => 
      prevNotes.map((prevNote) => {
        if (prevNote._id === note._id) {
          console.log('prevNoteeeeeeeeeeeeeeeeee:', prevNote);
          return {
            ...prevNote,
            tasks: prevNote.tasks.map((task, i) =>
              i === indexTask ? updatedTask : task
            ),
          };
        } else {
          return prevNote;
        }
      })
    );
  };
    
    
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <small>{note.category}</small><br/>
      <small>Author: {noteAuthor}</small><br/>
      <small>
        Access: {note.noteAccess === 'public' 
          ? 'Public' 
          : note.noteAccess === 'private' 
          ? 'Private' 
          : `Shared with: ${note.allowedUsers && note.allowedUsers.join(', ')}`}
      </small>
      {note.content && note.content !== "" && (
        <div
          onClick={toggleExpand}
          style={{ cursor: 'pointer' }}
          dangerouslySetInnerHTML={{
            __html: isExpanded
              ? marked(note.content)
              : marked(note.content.substring(0, 100) + (note.content.lenth > 200 ? '...' : '')),
          }}
        />
      )}

      {note.isTodo && (
        <ul>
          {note.tasks.map((task, taskIndex) => (
            <li key={taskIndex}>
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => setCompleted(taskIndex)}
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
      )}
      <small>Created: {new Date(note.createDate).toLocaleString()}</small><br/>
      <small>Last Modified: {new Date(note.updateDate).toLocaleString()}</small><br/>
      <div className="notes-buttons">
        <div>
          <button
            className={`btn2 ${clickedButton === 'edit' + index ? 'active' : ''}`}
              onClick={() => onEdit(index)}
          >
            Edit
          </button>
          <button
            className={`btn btn-main ${clickedButton === 'delete' + index ? 'active' : ''}`}
            onClick={() => onDelete(index)}
          >
            Delete
          </button>
        </div>
        <div>
          <button
            className={`btn2 ${clickedButton === 'duplicate' + index ? 'active' : ''}`}
            onClick={() => onDuplicate(index)}
          >
            Duplicate
          </button>
          <button
            className={`btn btn-main ${clickedButton === 'copy' + index ? 'active' : ''}`}
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