import React, { useEffect, useState, useContext } from 'react';
import './css/App.css';
import './css/Notes.css';
import NoteCard from './NoteCard';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import { a } from 'react-spring';
import { canUserAccess, handleDuplicateNote, handleDeleteNote, handleEditNote, handleSaveEdit, sortNotes,  handleCopyContent } from './NotesUtils';

const currentUser = 'Bob'; // Qui potrebbe esserci l'utente autenticato
//const accessibleNotes = notes.filter(note => canUserAccess(note, currentUser));

const initialNotes = [
    // Puoi aggiungere alcune note di esempio qui 
    {
      title: 'First Note',
      category: 'Work',
      content: 'This is a note',
      author: 'Bob',
      accessList: 'public', // or 'private' or specific people ['Alice', 'Bob']
      createDate: new Date(),
      updateDate: new Date(),
    },
  { title: 'Second Note', category: 'Study', content: 'This is another note', author: 'Bob',
    accessList: 'private',createDate: new Date(), updateDate: new Date() },
  { title: 'Third Note', category: 'Personal', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam imperdiet quam fringilla libero rutrum lobortis. Nam id vulputate odio. Cras molestie quis ante et vestibulum. Nullam viverra leo quis libero vulputate ultricies sit amet et lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas vestibulum ligula ac tortor faucibus, eget viverra elit faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum eu diam interdum, luctus velit in, vehicula erat. Aliquam dapibus mauris eget nulla faucibus, vitae commodo massa placerat. Nam luctus felis nec fermentum lobortis. Aliquam ac odio a neque suscipit mollis. Cras sit amet felis dolor. Nam consequat, nulla vitae lacinia malesuada, ipsum nibh pulvinar mi, sit amet eleifend elit velit id nulla. Cras pretium elit luctus, laoreet turpis sed, scelerisque tellus. Fusce venenatis feugiat diam, id tristique ligula pellentesque vitae.',
    author: 'Alice A.', accessList: 'public',createDate: new Date(), updateDate: new Date() },
  { title: 'Fourth Note', category: 'Others', content: "# This is a markdown note\n\nHere is some **bold** text, and here is a list:\n\n- Item 1\n- Item 2\n- Item 3\n\nYou can also add [links](https://example.com) and other markdown syntax.",
    author: 'Someone', accessList: 'Alice, Bob', createDate: new Date(), updateDate: new Date() },
];

function NotesFunction() {
  const { updateStyles, updateIcon } = useContext(StyleContext);
  const [notes, setNotes] = useState(initialNotes || []);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteAccess, setNoteAccess] = useState('public');
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [sortCriterion, setSortCriterion] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [clickedButton] = useState(null);
  const [isEditing, setIsEditing] = useState(null);

  // change style page onload document
  useEffect(() => {
    updateStyles(true);
    updateIcon(iconDark);

    return () => {
        updateStyles(false);
        updateIcon(iconLight);
    };
  }, [updateIcon, updateStyles]);

  
  const handleAddNote = () => {
  if (noteTitle && noteCategory && noteContent && noteAuthor && noteAccess) {
    const newNote = { 
      title: noteTitle, 
      category: noteCategory, 
      content: noteContent, 
      author: noteAuthor,
      access: { 
        type: noteAccess, 
        allowedUsers: noteAccess === 'restricted' ? allowedUsers : [] // Add allowed users if restricted
      },
      createDate: new Date(),
      updateDate: new Date()
    };
    setNotes([...notes, newNote]);
    setNoteTitle('');
    setNoteCategory('');
    setNoteContent('');
    setNoteAuthor('');
    setNoteAccess('public');
  }
};

const filterNotesByDate = (notes) => {
  if (!filterDate) return notes;
  return notes.filter((note) =>
    note.createDate.toISOString().split('T')[0] === filterDate //If a date is selected it will filter the notes by that date
  );
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
      <h2>Add a note here:</h2>
       {/* Form for adding a new note */}
      <input
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Note Title"
      />
      <input
        value={noteAuthor}
        onChange={(e) => setNoteAuthor(e.target.value)}
        placeholder="Author Name"
      />
       <select id = "category"
        value={noteCategory}
        onChange={(e) => setNoteCategory(e.target.value)}
      >
        <option value="">Category</option>
        <option value="Work">Work</option>
        <option value="Study">Study</option>
        <option value="Personal">Personal</option>
        <option value="Others">Others</option>
      </select>
      <div className="note-content">
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Note Content"
      />
      </div>
       {/* Dropdown for acces list */}
       <select value={noteAccess} onChange={(e) => setNoteAccess(e.target.value)}>
        <option value="">Access List</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="restricted">Specific People</option>
      </select>
      {noteAccess === 'restricted' && (
      <div>
        <input 
          type="text" 
          placeholder="Allowed User" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newUser = e.target.value.trim();
              if (newUser && !allowedUsers.includes(newUser)) {
                setAllowedUsers([...allowedUsers, newUser]);
                e.target.value = ''; // Clear input field
              }
            }
          }} 
        />
        <ul>
          {allowedUsers.map((user, index) => (
            <li key={index}>
              {user} <button className = "btn" onClick={() => setAllowedUsers(allowedUsers.filter(u => u !== user))}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    )}
      <button className="btn" onClick={handleAddNote} disabled={isEditing !== null}>Add Note</button>
      {/* Editing scenario*/}
      {isEditing !== null && (
        <button className="btn" onClick={() => handleSaveEdit(isEditing, notes, setNotes, noteTitle, noteCategory, noteContent, setIsEditing, setNoteTitle, setNoteCategory, setNoteContent)}>Save Note</button>
      )}
      <br/>
      {/* Note list, filtered and ordered */}
      <h2>Your Notes:</h2>
      <div className="notes-container">
        <div className = "scrollable-Card-list">
          {filterNotesByDate(sortNotes(notes)).map((note, index) => (
            <NoteCard
              key={index}
              note={note}
              index={index}
              onDuplicate={() => handleDuplicateNote(index, notes, setNotes)}
              onCopy={() => handleCopyContent(note.content)}
              onDelete={() => handleDeleteNote(index, notes, setNotes)}
              onEdit={() => handleEditNote(index, notes, setNoteTitle, setNoteCategory, setNoteContent, setIsEditing)}
            />
          ))}
        </div> 
      </div>
    </div>
  );
}

export { initialNotes };
export default NotesFunction;
