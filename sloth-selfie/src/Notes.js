import React, { useState } from 'react';
import './css/App.css';

function NotesFunction() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const handleAddNote = () => {
    if (noteTitle && noteContent) {
      setNotes([...notes, { title: noteTitle, content: noteContent, date: new Date() }]);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  const handleDuplicateNote = (index) => {
    const noteToDuplicate = notes[index];
    const duplicatedNote = { ...noteToDuplicate, date: new Date() }; // Duplicate with a new date
    setNotes([...notes, duplicatedNote]);
  };

  const sortNotes = (notes) => {
    switch (sortCriterion) {
      case 'alphabetical':
        return [...notes].sort((a, b) => a.title.localeCompare(b.title));
      case 'length':
        return [...notes].sort((a, b) => b.content.length - a.content.length);
      case 'most_recent':
        return [...notes].sort((a, b) => b.date - a.date);
      case 'least_recent':
        return [...notes].sort((a, b) => a.date - b.date);

      default:
        return notes;
    }
  };

  const filterNotesByDate = (notes) => {
    if (!filterDate) return notes;
    return notes.filter((note) =>
      note.date.toISOString().split('T')[0] === filterDate //If a date is selected it will filter the notes by that date
    );
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!');
    });
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
          <option value="most_recent">Most Recent</option>
          <option value="least_recent">Least Recent</option>
        </select>
      </div>

      {/* Input field to sort by data */}
      <div className="date-filter">
        <label htmlFor="date">Filter by Date: </label>
        <input
          type="date"
          id="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
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

      {/* Note list, filtered and ordered */}
      <ul>
        {filterNotesByDate(sortNotes(notes)).map((note, index) => (
          <li key={index}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            {/*If the note has a date we show it, else: "N/A" */}
            <small>{note.date ? note.date.toLocaleString() : 'N/A'}</small>
            <button onClick={() => handleDuplicateNote(index)}>Duplicate</button>
            <button onClick={() => handleCopyContent(note.content)}>Copy</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesFunction;
