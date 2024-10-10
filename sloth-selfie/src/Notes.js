import React, { useEffect, useState } from 'react';
import './css/App.css';
import './css/Notes.css';
import NoteCard from './NoteCard';

function NotesFunction() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [clickedButton] = useState(null);
  const [isEditing, setIsEditing] = useState(null);

  // change style page onload document
  useEffect(() => {
    const header = document.querySelector('.App-header');
    const h1 = document.querySelector('h1');
    if (header) header.classList.add('light-background');
    else console.error('Header not found');
    if (h1) h1.classList.add('dark-h1');

    document.body.classList.add('light-background');

    return () => {
      if (header) header.classList.remove('light-background');
      if (h1) h1.classList.remove('dark-h1');
      document.body.classList.remove('light-background');
    };
  }, []);
  
  const handleAddNote = () => {
  if (noteTitle && noteCategory && noteContent) {
    const newNote = { 
      title: noteTitle, 
      category: noteCategory, 
      content: noteContent, 
      createDate: new Date(),
      updateDate: new Date()
    };
    setNotes([...notes, newNote]);
    setNoteTitle('');
    setNoteCategory('');
    setNoteContent('');
  }
};

  const handleDuplicateNote = (index) => {
    const noteToDuplicate = notes[index];
    const duplicatedNote = { ...noteToDuplicate, date: new Date() }; // Duplicate with a new date
    setNotes([...notes, duplicatedNote]);
  };

  const handleDeleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
};

const handleEditNote = (index) => {
  setIsEditing(index);
  setNoteTitle(notes[index].title);
  setNoteCategory(notes[index].category);
  setNoteContent(notes[index].content);
};

const handleSaveEdit = (index) => {
  const updatedNote = {
    ...notes[index],
    title: noteTitle,
    category: noteCategory,
    content: noteContent,
    updateDate: new Date() // updates the modify date
  };

  const updatedNotes = [...notes];
  updatedNotes[index] = updatedNote;
  setNotes(updatedNotes);
  setIsEditing(null); // exit from edit mode
  setNoteTitle('');
  setNoteCategory('');
  setNoteContent('');
};

  const sortNotes = (notes) => {
    switch (sortCriterion) {
      case 'alphabetical':
        return [...notes].sort((a, b) => a.title.localeCompare(b.title));
      case 'length':
        return [...notes].sort((a, b) => b.content.length - a.content.length);
      case 'most_recent':
        return [...notes].sort((a, b) => b.updateDate - a.updateDate);
      case 'least_recent':
        return [...notes].sort((a, b) => a.updateDate - b.updateDate);

      default:
        return notes;
    }
  };

  const filterNotesByDate = (notes) => {
    if (!filterDate) return notes;
    return notes.filter((note) =>
      note.createDate.toISOString().split('T')[0] === filterDate //If a date is selected it will filter the notes by that date
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
      <input
        value = {noteCategory}
        onChange={(e)=> setNoteCategory(e.target.value)}
        placeholder='Note Category'
      />
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Note Content"
      />
      <button className="btn" onClick={handleAddNote}>Add Note</button>
      {/* Editing scenario*/}
      {isEditing !== null && (
        <button className="btn" onClick={() => handleSaveEdit(isEditing)}>Save Note</button>
      )}
      <br/>
      {/* Note list, filtered and ordered */}
      <h2>Your Notes:</h2>
      <div className="notes-container">
        <div className = "scrollable-list">
          {filterNotesByDate(sortNotes(notes)).map((note, index) => (
            <NoteCard
              key={index}
              note={note}
              index={index}
              onDuplicate={handleDuplicateNote}
              onCopy={handleCopyContent}
              onDelete={handleDeleteNote}
              onEdit={handleEditNote}
              clickedButton={clickedButton}
            />
          ))}
        </div> 
      </div>
    </div>
  );
}

export default NotesFunction;
