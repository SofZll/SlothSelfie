import React, { useEffect, useState, useContext } from 'react';
import './css/App.css';
import './css/Notes.css';
import NoteCard from './NoteCard';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import { fetchNotes, handleNoteDataChange, canUserAccess, addTask, removeTask, toggleTaskCompletion, handleDuplicateNote, handleDeleteNote, handleEditNote, handleSaveEditNote, sortNotes,  handleCopyContent, fetchUsername, handleAddNote } from './NotesUtils';
import ShareInput from './ShareInput';


function NotesFunction() {
  const { updateStyles, updateIcon } = useContext(StyleContext);

  const [notes, setNotes] = useState([]);
  const [sortCriterion, setSortCriterion] = useState('most_recent');
  const [filterDate, setFilterDate] = useState("");

  const [isEditing, setIsEditing] = useState(null);
  const [username, setUsername] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  const [taskDeadline, setTaskDeadline] = useState(null);

  //defining the note data structure
  const [noteData, setNoteData] = useState({
    id: null,
    title: "",
    category: "",
    content: "",
    noteAccess: "public",
    allowedUsers: [], //Usernames
    isTodo: false,
    tasks: [],
    createDate: new Date(), //used in Notecard
    updateDate: new Date(), //used in Notecard
    user: null,
  });

  // change style page onload document
  useEffect(() => {
    updateStyles(true);
    updateIcon(iconDark);

    return () => {
        updateStyles(false);
        updateIcon(iconLight);
    };
  }, [updateIcon, updateStyles]);

  // Get the username of the authenticated user
  useEffect(() => {
    
    fetchUsername().then((user) => {
      setUsername(user);
    });
  }, []); 

  useEffect(() => {
    fetchNotes().then((data) => {
      setNotes(data);
    });
  }, []);

    
  //If a date is selected it will filter the notes by that date
  const filterNotesByDate = (notes) => {
    if (!filterDate) return notes;

    if (!Array.isArray(notes)) {
      console.error('Invalid notes array:', notes);
      return [];
    }

    return notes.filter((note) => {
      if (!note.createDate) return false;
      const noteDate = note.createDate instanceof Date ? note.createDate : new Date(note.createDate);
      return noteDate.toISOString().split('T')[0] === filterDate;
    });
  };

  //filters and sorts notes every time the filter/sort criteria change
  useEffect(() => {
    const filteredAndSorted = filterNotesByDate(sortNotes(notes, sortCriterion));
    console.log('Filtered and sorted notes:', filteredAndSorted);
    setFilteredNotes(filteredAndSorted);
  }, [notes, filterDate, sortCriterion]);

  //edit note function
  const handleEditCard = (note) => {
    const noteToEdit = notes.find(n => n._id === note._id && canUserAccess(n, username));
    if (noteToEdit) {
      handleEditNote(noteToEdit, setNoteData, setIsEditing);
    } else {
      console.error("Note not found or access denied", note);
    }
  };


  //function to add a todo task
  const handleUpdateDataOnDrop = (e) => {
    if (e && e.key === 'Enter') {
      e.preventDefault();

      addTask(e.target.value, noteData, setNoteData, taskDeadline);
      e.target.value = '';
      setTaskDeadline('');
    }
  };

  //function to add allowed users to the note
  const handleAllowedUsers = (e) => {

    if (e.key === 'Enter') {
      const newUser = e.target.value.trim();
      if (newUser && !noteData.allowedUsers.includes(newUser)) {
        
        handleNoteDataChange('allowedUsers', [...noteData.allowedUsers, newUser], setNoteData)
        e.target.value = ''; // Clear input field
      }
    }
  };

  // ShareInput
  const [receivers, setReceivers] = useState([]);
  const [triggerResetReceivers, setTriggerResetReceivers] = useState(0);

  const changeReceivers = (newReceivers) => {
    setReceivers(newReceivers);
  }

  const resetReceivers = () => {
      setReceivers([]);
      setTriggerResetReceivers((prev) => prev+1);
      console.log(triggerResetReceivers);
  }

  return (
    <div className="notes-div">

      {/* Filtering note bar */}
      <div className="my-notes-div">
        <h2>Your Notes:</h2>
        <div className='selection-div'>
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

          <div className="date-filter">
            <label htmlFor="date">Filter by Date: </label>
            <input
              type="date"
              id="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        <div className="notes-container">
          {Array.isArray(filteredNotes) && filteredNotes.length === 0 ? (
            <p>No notes found</p>
          ) : (
            filteredNotes.map((note) => {
              return (
                <NoteCard
                  key={note._id}
                  note={note}
                  setNotes={setNotes}
                  isPreview={false}
                  onDuplicate={() => { handleDuplicateNote(note._id, notes, setNotes) }} // Add curly braces
                  onCopy={() => handleCopyContent(note.content, (note.isTodo ? note.tasks : null))}
                  onDelete={() => handleDeleteNote(note._id, notes, setNotes)}
                  onEdit={() => handleEditCard(note)}
                />
              );
            })
          )}
        </div> 
      </div>

      <div className="note-add">
        <h2>Add a note here:</h2>
          {/* Form for adding a new note */}
        <div className='div-input'>
          <div className='div-input-title'>
            <label htmlFor='noteTitle'>Note Title: </label>
            <input
              value={noteData.title}
              onChange={(e) => handleNoteDataChange('title', e.target.value, setNoteData)}
              placeholder="Enter title"
            />
          </div>

          <div className='div-input-author'>
            <p>Author name: </p>
            <p>{username}</p>
          </div>

          <div className='div-input-category'>
            <label htmlFor='category'>Note category: </label>
            <select id = "category"
              value={noteData.category}
              onChange={(e) => handleNoteDataChange('category', e.target.value, setNoteData)}
            >
              <option value="">Category</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <ShareInput changeReceivers={changeReceivers} resetReceivers={triggerResetReceivers}/>
        </div>

        <div className='div-content'>
          <h2>Choose one: free Note content or Todo list?</h2>
          <div className="note-content">
            <div className='div-input-content'>
              <textarea
                value={noteData.content}
                onChange={(e) => handleNoteDataChange('content', e.target.value, setNoteData)}
                placeholder="Note Content"
              />
            </div>
          
            <div className='div-input-todo'>
              <label>
                <input
                  type="checkbox"
                  checked={noteData.isTodo}
                  onChange={() => handleNoteDataChange('isTodo', !noteData.isTodo, setNoteData)}
                  className='checkbox'
                />
                Is this a to-do list?
              </label>

            
              {noteData.isTodo && (
                <div>
                  <label>Add a task:</label>
                  <input
                    type="text"
                    placeholder="Add task and press Enter"
                    onKeyDown={(e) => handleUpdateDataOnDrop(e)}
                  />
                  <label>Task Deadline (Optional):</label>
                  <input
                    type="date" 
                    value={taskDeadline || ''}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                  />

                  {noteData.tasks && noteData.tasks.length > 0 &&(
                    <ul>
                      {noteData.tasks.map((task, index) => (
                        <li key={index}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(index, noteData, setNoteData)}
                          />
                          {task.text}
                          {task.deadline && <span> - Deadline: {new Date(task.deadline).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')}</span>}
                          <button className="btn btn-main" onClick={() => removeTask(index, noteData, setNoteData)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Dropdown for acces list */}
          <select value={noteData.noteAccess} onChange={(e) => handleNoteDataChange('noteAccess', e.target.value, setNoteData)}>
            <option value="">Access List</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="restricted">Specific People</option>
          </select>

          {noteData.noteAccess === "restricted" && (
            <div className='div-input-accesslist'>
              <label>Allowed Users:</label>
              <input
                type="text"
                placeholder="Add user and press Enter"
                onKeyDown={handleAllowedUsers}
              />
              {noteData.allowedUsers && (
                <ul>
                  {noteData.allowedUsers.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {isEditing ? (
            <button className="btn btn-main" onClick={() => handleSaveEditNote(noteData.id, notes, setNotes, noteData, setNoteData, setIsEditing)}>Save Note</button>
          ) : (
            <button className="btn btn-main" onClick={() => handleAddNote(noteData, setNoteData, notes, setNotes)}>Add Note</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotesFunction;
