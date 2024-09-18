import React, { useState } from 'react';

function NotesFunction() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');

  const handleAddNote = () => {
    if (noteTitle && noteContent) {
      setNotes([...notes, { title: noteTitle, content: noteContent, date: new Date() }]);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  const sortNotes = (notes) => {
    switch (sortCriterion) {
      case 'alphabetical':
        return [...notes].sort((a, b) => a.title.localeCompare(b.title));
      case 'length':
        return [...notes].sort((a, b) => b.content.length - a.content.length);
      case 'recent':
        return [...notes].sort((a, b) => b.date - a.date);
      default:
        return notes;
    }
  };

  return (
    <div className="notes-section">
      <h2>Notes</h2>
       {/* Filtering note bar */}
      <div className="filter-bar">
        <label htmlFor="filter">Filter Notes: </label>
        <select id="filter" value={sortCriterion} onChange={(e) => setSortCriterion(e.target.value)}>
          <option value="">Select...</option>
          <option value="alphabetical">Alphabetical Order</option>
          <option value="length">By Length</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

       {/* Form for adding a new note */}
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

      {/* Note list */}
      <ul>
        {notes.map((note, index) => (
          <li key={index}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            {/*If the note has a date we show it, else: "N/A" */}
            <small>{note.date ? note.date.toLocaleString() : 'N/A'}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesFunction;
