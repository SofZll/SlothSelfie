import React, { useEffect, useState, useContext } from 'react';
import './css/App.css';
import './css/Notes.css';
import NoteCard from './NoteCard';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import { fetchNotes, handleNoteDataChange, canUserAccess, addTask, removeTask, toggleTaskCompletion, handleDuplicateNote, handleDeleteNote, handleEditNote, handleSaveEdit, sortNotes,  handleCopyContent, fetchUsername, handleAddNote } from './NotesUtils';
import Swal from 'sweetalert2';
import ShareInput from './ShareInput';


const initialNotes = [
    // Puoi aggiungere alcune note di esempio qui 
    {
      id: 0,
      title: 'First Note',
      category: 'Work',
      content: 'This is a note',
      access: { 
        type: 'public', 
        allowedUsers: []
      },
      isTodo: false,
      tasks: [],
      createDate: new Date(),
      updateDate: new Date(),
    },
  { id: 1, title: 'Second Note', category: 'Study', content: 'This is another note', noteAuthor: 'tiziocaio200',
    access: { 
      type: 'private', 
      allowedUsers: [] 
    },
    isTodo: false, tasks: [],
    createDate: new Date(), updateDate: new Date() },
  { id: 2, title: 'Third Note', category: 'Personal', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam imperdiet quam fringilla libero rutrum lobortis. Nam id vulputate odio. Cras molestie quis ante et vestibulum. Nullam viverra leo quis libero vulputate ultricies sit amet et lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas vestibulum ligula ac tortor faucibus, eget viverra elit faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum eu diam interdum, luctus velit in, vehicula erat. Aliquam dapibus mauris eget nulla faucibus, vitae commodo massa placerat. Nam luctus felis nec fermentum lobortis. Aliquam ac odio a neque suscipit mollis. Cras sit amet felis dolor. Nam consequat, nulla vitae lacinia malesuada, ipsum nibh pulvinar mi, sit amet eleifend elit velit id nulla. Cras pretium elit luctus, laoreet turpis sed, scelerisque tellus. Fusce venenatis feugiat diam, id tristique ligula pellentesque vitae.',
    noteAuthor: 'Alice', access: { 
      type: 'public', //if private Bob can't see it
      allowedUsers: [] 
    },
    isTodo: false, tasks: [],
    createDate: new Date(), updateDate: new Date() },
  { id: 3, title: 'Fourth Note', category: 'Others', content: "# This is a markdown note\n\nHere is some **bold** text, and here is a list:\n\n- Item 1\n- Item 2\n- Item 3\n\nYou can also add [links](https://example.com) and other markdown syntax.",
    access: { 
      type: 'restricted', 
      allowedUsers: ['Alice', 'tiziocaio200'] 
    },
    isTodo: false, tasks: [],
    createDate: new Date(), updateDate: new Date() },
    {
      id: 4,
      title: 'Fifth Note',
      category: 'Work',
      content: '',
      access: { 
        type: 'public', 
        allowedUsers: []
      },
      isTodo: true, tasks: [
        { text: "Task 1", completed: false, deadline: null },
        { text: "Task 2", completed: true, deadline: null },
        { text: "Task 3", completed: false, deadline: '2024-11-25' },
      ],
      createDate: new Date(),
      updateDate: new Date(),
    },

];

function NotesFunction() {
  const { updateStyles, updateIcon } = useContext(StyleContext);

  const [notes, setNotes] = useState([] || initialNotes);
  const [sortCriterion, setSortCriterion] = useState('most_recent');
  const [filterDate, setFilterDate] = useState('');

  const [isEditing, setIsEditing] = useState(null);
  const [username, setUsername] = useState("");//username of the authenticated user, we use it for the note rendering
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
    console.log('Notesssssssssssssssss:', notes);
    const filteredAndSorted = filterNotesByDate(sortNotes(notes, sortCriterion));
    setFilteredNotes(filteredAndSorted);
  }, [notes, filterDate, sortCriterion]);

  //edit note function
  const handleEditCard = (note) => {
    const noteToEdit = notes.find(n => n.id === note.id && canUserAccess(n, username));
    if (noteToEdit) {
      handleEditNote(noteToEdit.id, notes, setNoteData, setIsEditing);
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
                  key={note.id}
                  note={note}
                  onDuplicate={() => handleDuplicateNote(note.id, notes, setNotes)}
                  onCopy={() => handleCopyContent(note.content)}
                  onDelete={() => handleDeleteNote(note.id, notes, setNotes)}
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

                  {noteData.tasks && (
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
            <button className="btn btn-main">Add Note</button>
          ) : (
            <button className="btn btn-main">Save Note</button>
          )}
        </div>
      </div>
    </div>
  );
}

export { initialNotes };
export default NotesFunction;
