import React, { useEffect, useState, useContext } from 'react';
import './css/App.css';
import './css/Notes.css';
import NoteCard from './NoteCard';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import { a } from 'react-spring';
import { canUserAccess, addTask, removeTask, handleDuplicateNote, handleDeleteNote, handleEditNote, handleSaveEdit, sortNotes,  handleCopyContent } from './NotesUtils';

//TODO: AGGIUSTA LISTE E CONTENT

const initialNotes = [
    // Puoi aggiungere alcune note di esempio qui 
    {
      title: 'First Note',
      category: 'Work',
      content: 'This is a note',
      author: 'Bob',
      access: { 
        type: 'public', 
        allowedUsers: [] 
      },
      createDate: new Date(),
      updateDate: new Date(),
    },
  { title: 'Second Note', category: 'Study', content: 'This is another note', author: 'Bob',
    access: { 
      type: 'private', 
      allowedUsers: [] 
    },createDate: new Date(), updateDate: new Date() },
  { title: 'Third Note', category: 'Personal', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam imperdiet quam fringilla libero rutrum lobortis. Nam id vulputate odio. Cras molestie quis ante et vestibulum. Nullam viverra leo quis libero vulputate ultricies sit amet et lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas vestibulum ligula ac tortor faucibus, eget viverra elit faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum eu diam interdum, luctus velit in, vehicula erat. Aliquam dapibus mauris eget nulla faucibus, vitae commodo massa placerat. Nam luctus felis nec fermentum lobortis. Aliquam ac odio a neque suscipit mollis. Cras sit amet felis dolor. Nam consequat, nulla vitae lacinia malesuada, ipsum nibh pulvinar mi, sit amet eleifend elit velit id nulla. Cras pretium elit luctus, laoreet turpis sed, scelerisque tellus. Fusce venenatis feugiat diam, id tristique ligula pellentesque vitae.',
    author: 'Alice', access: { 
      type: 'public', //if private Bob can't see it
      allowedUsers: [] 
    },createDate: new Date(), updateDate: new Date() },
  { title: 'Fourth Note', category: 'Others', content: "# This is a markdown note\n\nHere is some **bold** text, and here is a list:\n\n- Item 1\n- Item 2\n- Item 3\n\nYou can also add [links](https://example.com) and other markdown syntax.",
    author: 'Someone', access: { 
      type: 'restricted', 
      allowedUsers: ['Alice', 'Bob'] 
    }, createDate: new Date(), updateDate: new Date() },
];

const currentUser = 'Bob'; // Qui potrebbe esserci l'utente autenticato

function NotesFunction() {
  const { updateStyles, updateIcon } = useContext(StyleContext);
  const [notes, setNotes] = useState(initialNotes || []);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState(currentUser);
  const [noteAccess, setNoteAccess] = useState('public');
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [isTodo, setIsTodo] = useState(false);
  const [tasks, setTasks] = useState([]);
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
    console.log("isTodo:", isTodo);
    console.log("noteContent:", noteContent);
    console.log("tasks:", tasks);

    if (!isTodo && noteContent.trim() === "") {
        alert("Add content to your note!");
        return;
    }
  if (noteTitle && noteCategory && (noteContent || isTodo) && noteAuthor && noteAccess) {
    const newNote = { 
      title: noteTitle, 
      category: noteCategory, 
      content: isTodo ? "" : noteContent.trim(), // If isTodo, content is empty 
      author: currentUser,
      access: { 
        type: noteAccess, 
        allowedUsers: noteAccess === 'restricted' ? allowedUsers : [] // Add allowed users if restricted
      },
      isTodo: isTodo, // Add tasks if isToDo
      tasks: isTodo ? tasks.map(task => ({ ...task, completed: task.completed || false })) : [],
      createDate: new Date(),
      updateDate: new Date()
    };
    setNotes([...notes, newNote]);
    setNoteTitle('');
    setNoteCategory('');
    setNoteContent('');
    setNoteAuthor('');
    setNoteAccess('public');
    setIsTodo(false);
    setTasks([]);
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
        placeholder="Author Name: enter username"
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
       <label>
       <input
         type="checkbox"
         checked={isTodo}
         onChange={() => setIsTodo(!isTodo)}
       />
       Is this a to-do list?
     </label>

     {/* Input per aggiungere task se isTodo è true */}
     {isTodo && (
       <div>
         <input
           type="text"
           placeholder="Add task and press Enter"
           onKeyDown={(e) => {
             if (e.key === 'Enter') {
               addTask(e.target.value, tasks, setTasks);
               e.target.value = ''; // Clear input after adding task
             }
           }}
         />
         <ul>
           {tasks.map((task, index) => (
             <li key={index}>
               {task.text} <button className='btn' onClick={() => removeTask(index, tasks, setTasks)}>Remove</button>
             </li>
           ))}
         </ul>
       </div>
     )}
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
        {/* We include the current user*/}
        {currentUser && !allowedUsers.includes(currentUser) && 
          setAllowedUsers(prevUsers => [...prevUsers, currentUser])
        }
        <input 
          type="text" 
          placeholder="type and press Enter" 
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
        <button className="btn" onClick={() => handleSaveEdit(isEditing, notes, setNotes, noteTitle, noteCategory, noteContent, setIsEditing, setNoteTitle, setNoteCategory, setNoteContent, noteAuthor, noteAccess, allowedUsers, setNoteAuthor, setNoteAccess, setAllowedUsers)}>Save Note</button>
      )}
      <br/>
      {/* Note list, filtered and ordered */}
      <h2>Your Notes:</h2>
      <div className="notes-container">
        <div className = "scrollable-Card-list">
          {/* Filter the accessible notes from the users and the orders */}
          {filterNotesByDate(sortNotes(notes.filter(note => canUserAccess(note, currentUser)))).map((note, index) => (
            <NoteCard
              key={index}
              note={note}
              index={index}
              onDuplicate={() => handleDuplicateNote(index, notes, setNotes)}
              onCopy={() => handleCopyContent(note.content)}
              onDelete={() => handleDeleteNote(index, notes, setNotes)}
              onEdit={() => handleEditNote(index, notes, setNoteTitle, setNoteCategory, setNoteContent, setIsEditing, setNoteAuthor, setNoteAccess, setAllowedUsers)}
            />
          ))}
        </div> 
      </div>
    </div>
  );
}

export { initialNotes };
export default NotesFunction;
