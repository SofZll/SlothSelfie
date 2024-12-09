import React, { useEffect, useState, useContext } from 'react';
import './css/App.css';
import './css/Notes.css';
import NoteCard from './NoteCard';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import { a } from 'react-spring';
import { fetchNotes, handleNoteDataChange, canUserAccess, addTask, removeTask, toggleTaskCompletion, handleDuplicateNote, handleDeleteNote, handleEditNote, handleSaveEdit, sortNotes,  handleCopyContent } from './NotesUtils';
import { handleAddData} from './CalendarUtils';
import { ActivityContext } from './ActivityContext';
import Swal from 'sweetalert2';

//TODO1: manca COLLEGAMENTO CON TASK E ACTIVITY

const initialNotes = [
    // Puoi aggiungere alcune note di esempio qui 
    {
      id: 0,
      title: 'First Note',
      category: 'Work',
      content: 'This is a note',
      noteAuthor: 'tiziocaio200',
      access: { 
        type: 'public', 
        allowedUsers: []
      },
      isTodo: false, tasks: [],
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
    noteAuthor: 'Someone', access: { 
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
      noteAuthor: 'tiziocaio200',
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
  const [notes, setNotes] = useState(initialNotes || []);
  const [sortCriterion, setSortCriterion] = useState('most_recent');
  const [filterDate, setFilterDate] = useState('');
  const [clickedButton] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [username, setUsername] = useState("");//username of the authenticated user, we use it for the note rendering
  const [filteredNotes, setFilteredNotes] = useState([]);
  const { activities, setActivities, setActivityData} = useContext(ActivityContext);
  
  //defining the note data structure
  const [noteData, setNoteData] = useState({
    title: "",
    category: "",
    content: "",
    noteAuthor: "", //Username
    noteAccess: "public",
    allowedUsers: [], //Usernames
    isTodo: false,
    tasks: [],
    /*
    tasks: [
      {
        id: 0,  
        text: "",  
        completed: false,
        deadline: null  //optional
      }
    ],
    */
    taskDeadline: '', // Deadline for the task while creating it, it is used to set the deadline before creating the task
    createDate: new Date(), //used in Notecard
    updateDate: new Date(), //used in Notecard
  });

  // Get the username of the authenticated user
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user/username', {
        credentials: 'include'
        });const data = await response.json();
        console.log('Username:', data.username);
        setNoteData({ ...noteData, noteAuthor: data.username });
        setUsername(data.username);
    } catch (error) {
        console.error('Error fetching username:', error);
    }
    };

    fetchUsername();
}, []); 

  useEffect(() => {
      fetchNotes(setNotes);
  }, []);

useEffect(() => {
  console.log('Notes after fetch', notes);
}, [notes]);


useEffect(() => {
  console.log("noteData has been updated:", noteData);
}, [noteData]);

//filters and sorts notes every time the filter/sort criteria change
useEffect(() => {
  const filteredAndSorted = filterNotesByDate(sortNotes(notes, sortCriterion));
  setFilteredNotes(filteredAndSorted);
}, [notes, filterDate, sortCriterion, username]);

  // change style page onload document
  useEffect(() => {
    updateStyles(true);
    updateIcon(iconDark);

    return () => {
        updateStyles(false);
        updateIcon(iconLight);
    };
  }, [updateIcon, updateStyles]);


  const handleAddNote = async () => {

    if (!noteData.title || !noteData.noteAuthor || !noteData.category) {
      Swal.fire({
        title: 'Add Note failed',
        icon: 'error',
        text: 'Please fill in all fields',
        customClass: {
          confirmButton: 'button-alert'
        }
      });
      return;
    }

    if (!noteData.isTodo && noteData.content.trim() === "") {
        Swal.fire({
          title: 'Add Note failed',
          icon: 'error',
          text: 'Please add content to your note',
          customClass: {
            confirmButton: 'button-alert'
          }
        });
        return;
    }

    if (noteData.isTodo && noteData.tasks.length === 0) {
      Swal.fire({
        title: 'Add Note failed',
        icon: 'error',
        text: 'Please add at least one task to your to-do list',
        customClass: {
          confirmButton: 'button-alert'
        }
      });
    return;
  }

  if (noteData.title && noteData.category && (noteData.content || noteData.isTodo) && noteData.noteAuthor && noteData.noteAccess) {
    const newNote = { 
      title: noteData.title, 
      category: noteData.category, 
      content: noteData.isTodo ? "" : noteData.content.trim(), // If isTodo, content is empty 
      noteAuthor: noteData.noteAuthor,
      noteAccess: noteData.noteAccess, 
      allowedUsers: noteData.noteAccess === 'restricted' ? noteData.allowedUsers : [], // Add allowed users if restricted
      isTodo: noteData.isTodo, // Add tasks if isToDo
      tasks: noteData.isTodo 
      ? noteData.tasks.map(task => ({ 
        ...task, 
        completed: task.completed || false,
        deadline: task.deadline || null
      })) : [],
      createDate: noteData.createDate ? new Date(noteData.createDate) : new Date(),
      updateDate: noteData.updateDate ? new Date(noteData.updateDate) : new Date(),
    };

     // Add tasks as activities if they have a deadline
     if (noteData.isTodo) {
      console.log("Adding tasks as activities...");
      noteData.tasks.forEach(task => {
        if (task.deadline && task.completed === false) {
          //we create an activity
          const activityData = {
            title: task.text,
            deadline: task.deadline,
            type: 'activity',
          };
          console.log("Activity data:", activityData);
          setActivities(prevActivities => [...prevActivities, activityData]);
          handleAddData(null, activityData, setActivityData, activities, setActivities, username);
        }else {
          console.log("Task without deadline:", task);}
      });
    }
    try {
      //const response = await fetch('/api/note', {
       //locale:
       const response = await fetch('http://localhost:8000/api/note', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newNote)
      });

      if (!response.ok) {
          throw new Error('Errore nella creazione della nota');
      }

      // Get the saved note from the backend
      const savedNote = await response.json();

      console.log("Nota salvata dal backend:", savedNote);
      setNotes([...notes, savedNote]);
      fetchNotes(setNotes);
      console.log("Notes after adding:", notes);

      //resetting fields
      handleNoteDataChange('title', '', setNoteData);
      handleNoteDataChange('category', '', setNoteData);
      handleNoteDataChange('content', '', setNoteData);
      handleNoteDataChange('noteAccess', 'public', setNoteData);
      handleNoteDataChange('isTodo', false, setNoteData);
      handleNoteDataChange('tasks', [], setNoteData);
    }
    catch(error){
      console.error('Error while adding note:', error);
    }
  }
}

////If a date is selected it will filter the notes by that date
const filterNotesByDate = (notes) => {
  if (!filterDate) return notes;

  return notes.filter((note) => {
    if (!note.createDate) return false;
    const noteDate = note.createDate instanceof Date ? note.createDate : new Date(note.createDate);
    return noteDate.toISOString().split('T')[0] === filterDate;
  });
};

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
        </div>

        {/* Note list, filtered and ordered */}
        <div className="notes-container">
          {/* Filter the accessible notes from the users and the orders */}
          {filterNotesByDate(
                sortNotes(
                    notes
                        .filter(note => note && note.noteAccess)
                        .filter(note => {
                          return canUserAccess(note, username);
                        }),
                    sortCriterion
                )
            ).map((note) => {
              return (
                  <NoteCard
                      key={note._id}
                      note={note}
                      onDuplicate={() => handleDuplicateNote(note._id, notes, setNotes)}
                      onCopy={() => handleCopyContent(note.content)}
                      onDelete={() => handleDeleteNote(note._id, notes, setNotes)}
                      onEdit={() => {
                        // find the note to edit by id
                        const noteToEdit = notes
                          .find(n => n._id === note._id && canUserAccess(n, n.noteAuthor));
                        
                        if (noteToEdit) {
                          handleEditNote(noteToEdit._id, notes, setNoteData, setIsEditing);
                        }
                        else {
                        console.error("Note not found or access denied", note);
                      }
                      }}
                  />
              );
          })}
        </div> 
      </div>

      <div className="note-add">
        <h2>Add a note here:</h2>
          {/* Form for adding a new note */}
        <div className='div-input'>
          <div className='div-input-title'>
            <label htmlFor='noteTutle'>Note Title: </label>
            <input
              value={noteData.title}
              onChange={(e) => handleNoteDataChange('title', e.target.value, setNoteData)}
              placeholder="Enter title"
            />
          </div>
          <div className='div-input-author'>
            <label htmlFor='Author'>Author name: </label>
            <input
              value={noteData.noteAuthor}
              onChange={(e) => handleNoteDataChange('noteAuthor', e.target.value, setNoteData)}
              placeholder="Enter username"
            />
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

            {/* Input for adding tasks if todo */}
            {noteData.isTodo && (
            <div>
              <input
                type="text"
                placeholder="Add task and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTask(e.target.value, noteData, setNoteData);
                    e.target.value = ''; // Clear input after adding task
                    handleNoteDataChange('deadline', '', setNoteData); // Reset deadline
                  }
                }}
              />
              <label>Task Deadline (Optional):</label>
              <input
                type="date" 
                value={noteData.taskDeadline || ''}  // Usa taskDeadline
                onChange={(e) => handleNoteDataChange('taskDeadline', e.target.value, setNoteData)}
              />
              {noteData.tasks && noteData.tasks.length > 0 && (
              <ul>
                {noteData.tasks.map((task, index) => (
                  <li key={index} className="task-item">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(index, noteData, setNoteData)}
                    />
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.text}
                    </span>
                    {task.deadline && ( 
                      <span className="task-deadline">
                        {/* Convert deadline format */}
                        &nbsp; Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <button className='btn btn-main' onClick={() => removeTask(index, noteData, setNoteData)}>Remove</button>
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
              {noteData.noteAccess === 'restricted' && (
            <div className='div-input-accesslist'>
              {/* We include the current user*/}
              {noteData.noteAuthor && Array.isArray(noteData.allowedUsers) && !noteData.allowedUsers.includes(noteData.noteAuthor) && 
              handleNoteDataChange('allowedUsers', [...noteData.allowedUsers, noteData.noteAuthor], setNoteData)
              }
              <input 
                type="text" 
                placeholder="type username and press Enter" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newUser = e.target.value.trim();
                    if (newUser && !noteData.allowedUsers.includes(newUser)) {
                      
                      handleNoteDataChange('allowedUsers', [...noteData.allowedUsers, newUser], setNoteData)
                      e.target.value = ''; // Clear input field
                    }
                  }
                }}
              />
              <ul>
                {noteData.allowedUsers.map((user, index) => (
                  <li key={index}>
                    {user} <button className = "btn btn-main" onClick={() => handleNoteDataChange('allowedUsers', noteData.allowedUsers.filter(u => u !== user), setNoteData)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn btn-main" onClick={handleAddNote} disabled={isEditing !== null}>Add Note</button>
            {/* Editing scenario*/}
            {isEditing !== null && (
          <button className="btn btn-main" onClick={() => handleSaveEdit(isEditing, notes, setNotes, noteData, setNoteData, setIsEditing, activities, setActivities)}>Save Note</button>
          )}
        </div>
      </div>
    </div>
  );
}

export { initialNotes };
export default NotesFunction;
