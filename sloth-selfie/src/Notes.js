import React, { useState } from 'react';
import './css/App.css';

function NotesFunction() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [clickedButton, setClickedButton] = useState(null);

  const handleButtonClick = (type, index) => {
    setClickedButton(type + index);//set the clicked btn status

    // after 500ms the color comes to normal
    setTimeout(() => {
      setClickedButton(null);
    }, 500);
  };

  const handleAddNote = () => {
  if (noteTitle && noteContent) {
    const newNote = { title: noteTitle, content: noteContent, date: new Date() };
    setNotes([...notes, newNote]);
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
      <button className="btn" onClick={handleAddNote}>Add Note</button>

      {/* Note list, filtered and ordered */}
      <ul>
        {filterNotesByDate(sortNotes(notes)).map((note, index) => (
          <li key={index}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <small>{note.date.toLocaleString()}</small>
            <div className='note-buttons'>
            <button
             className={`btn btn-duplicate ${clickedButton === 'duplicate' + index ? 'active' : ''}`}
             onClick={() =>{ handleDuplicateNote(index); handleButtonClick('duplicate', index);}}>Duplicate</button>
            <button
              className={`btn btn-copy ${clickedButton === 'copy' + index ? 'active' : ''}`}
             onClick={() =>{ handleCopyContent(note.content); handleButtonClick('copy', index)}}>Copy</button>
             </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesFunction;
