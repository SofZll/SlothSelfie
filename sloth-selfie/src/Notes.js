import React, { useState } from 'react';

function NotesFunction() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleAddNote = () => {
    if (noteTitle && noteContent) {
      setNotes([...notes, { title: noteTitle, content: noteContent }]);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  return (
    <div className="notes-section">
      <h2>Notes</h2>
      <input
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Note Title"
      />
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Note Content"
      />
      <button onClick={handleAddNote}>Add Note</button>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesFunction;
