
import Swal from 'sweetalert2';
import { handleAddData, handleDeleteData } from './CalendarUtils';

//TODO: Move to globalFunctions.js
//Function to fetch notes from the server
export async function fetchNotes() {
  try {
    
    const response = await fetch('http://localhost:8000/api/notes', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (Array.isArray(data.notes)) {
      return data.notes;
    } else {
      console.error('La risposta non contiene un array di note:', data);
      return [];
    }
  } catch (error) {
    console.error('Errore if fetching di notes:', error);
  }
};

//TODO: Move to globalFunctions.js
// Function to handle changes in note data
export function handleNoteDataChange (field, value, setNoteData) {
  setNoteData((prevData) => ({
      ...prevData,
      [field]: value
  }));
};

export function canUserAccess(note, currentUser) {
  
  if (!note.noteAccess) {
    return false;
  } else if (note.noteAccess === 'public') {
    return true;
  } else if (note.noteAccess === 'private') {
    return note.noteAuthor === currentUser;
  } else if (note.noteAccess === 'restricted') {
    return Array.isArray(note.allowedUsers) && note.allowedUsers.includes(currentUser);
  }

  return false;
}


export async function addTask(taskText, noteData, setNoteData, taskDeadline) {

  if (!Array.isArray(noteData.tasks)) {
    handleNoteDataChange('tasks', [], setNoteData);
  }

  const newTask = {
    text: taskText,
    completed: false,
    deadline: taskDeadline !== null ? new Date(taskDeadline) : null
  };

  try {
    const response = await fetch('http://localhost:8000/api/task', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    });

    if (!response.ok) {
      throw new Error('Error while adding task');
    }

    
    const savedTask = await response.json();
    if (savedTask) {
      setNoteData(prevNoteData => ({
        ...prevNoteData,
        tasks: [...prevNoteData.tasks, savedTask]
      }));
    }
  } catch (error) {
    console.error('Error while adding task:', error);
  }
}

export async function removeTask(taskIndex, noteData, setNoteData) {

  if (!Array.isArray(noteData.tasks)) {
    console.error('Tasks array not found');
    return;
  }

  if (taskIndex < 0 || taskIndex >= noteData.tasks.length) {
    console.error('Invalid task index:', taskIndex);
    return;
  }

  const taskToDelete = noteData.tasks[taskIndex];
  if (!taskToDelete) {
    console.error('Task not found:', taskIndex);
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/api/task/${taskToDelete._id}`, {
      method: 'DELETE',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error while deleting task');
    }


    setNoteData(prevNoteData => ({
      ...prevNoteData,
      tasks: prevNoteData.tasks.filter((task, i) => i !== taskIndex)
    }));
  } catch (error) {
    console.error('Error while deleting task:', error);
  }
};

export async function toggleTaskCompletion(taskIndex, noteData, setNoteData = null) {
  
  if (!Array.isArray(noteData.tasks)) {
    console.error('Tasks array not found');
    return null;
  }

  if (taskIndex < 0 || taskIndex >= noteData.tasks.length) {
    console.error('Invalid task index:', taskIndex);
    return null;
  }

  const taskToToggle = noteData.tasks[taskIndex];
  if (!taskToToggle) {
    console.error('Task not found:', taskIndex);
    return null;
  }
  console.log('Task to toggle:', taskToToggle._id);

  try {
    const response = await fetch(`http://localhost:8000/api/task/complete/${taskToToggle._id}`, {
      method: 'PUT',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Error while updating task');
    }

    const updatedTask = await response.json();
    if (updatedTask) {
      if(setNoteData !== null) {
        setNoteData(prevNoteData => ({
          ...prevNoteData,
          tasks: prevNoteData.tasks.map((task, i) => 
            i === taskIndex ? updatedTask : task
          )
        }));
      }
      return updatedTask;
    }
  } catch (error) {
    console.error('Error while updating task:', error);
  }
  
};

async function duplicateTasks (note) {

  if (!note) {
    console.error("Nota non trovata per l'ID:", note._id);
    return;
  }

  const duplicateTask = [];

  if (note.isTodo) {
    console.log("Duplicating tasks...");
    note.tasks.forEach(task => {
      const newTask = {
        ...task,
        _id: null,
        completed: false,
      };
      duplicateTask.push(newTask);
    });
  }

  let duplicatedTasks = [];

  for (let i = 0; i < duplicateTask.length; i++) {
    const task = duplicateTask[i];
    try {
      const response = await fetch('http://localhost:8000/api/task', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) {
        throw new Error('Error while duplicating task');
      }

      const savedTask = await response.json();
      console.log("Saved duplicated task:", savedTask);
      duplicatedTasks.push(savedTask._id);
    } catch (error) {
      console.error('Error while duplicating task:', error);
    }
  }

  return duplicatedTasks;
}

export async function handleDuplicateNote (noteId, notes, setNotes) {

  const noteToDuplicate = notes.find(note => note._id === noteId);

  if (!noteToDuplicate) {
    console.error("Nota non trovata per l'ID:", noteId);
    return;
  }

  let duplicateTask = [];

  if (noteToDuplicate.isTodo) {
    duplicateTask = await duplicateTasks(noteToDuplicate);
  }

  const noteToDuplicateNoId = { ...noteToDuplicate, _id: null };

  const duplicatedNote = { 
    ...noteToDuplicateNoId,
    tasks: duplicateTask,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
  };

  try {
    const response = await fetch('http://localhost:8000/api/note', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicatedNote)
    });

    if (!response.ok) {
      throw new Error("Error while duplicating note");
    }
    const savedNote = await response.json();
    console.log("Saved duplicated note:", savedNote);

    setNotes([...notes, savedNote.note]);
    fetchNotes(setNotes);
  } catch (error) {
    console.error("Errore durante la duplicazione della nota:", error);
  }
};

//Function to handle the deletion of a note
export async function handleDeleteNote(noteId, notes, setNotes) {
  if (!noteId) {
    console.error("ID della nota non trovato");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/api/note/${noteId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error while deleting note in backend');
    }

    //updating frontend
    setNotes(notes.filter(note => note._id !== noteId));
  } catch (error) {
    console.error('Errore durante l\'eliminazione della nota:', error);
  }
};

//TODO: Move in Note.js
export async function handleEditNote(noteId, notes, setNoteData, setIsEditing) {
  const noteToEdit = notes.find(note => note._id === noteId);

  if (!noteToEdit) {
    console.error("Nota non trovata per l'ID:", noteId);
    return;
  }

  console.log("Editing note with ID:", noteId);
  console.log("Note data:", noteToEdit);
  
  setNoteData({
    ...noteToEdit,
    tasks: noteToEdit.tasks || [],
    allowedUsers: noteToEdit.allowedUsers || [],
  });
  
  setIsEditing(noteId);
}

//TODO: delete
export async function handleSaveEdit(noteId, notes, setNotes, noteData, setNoteData, setIsEditing, activities, setActivities) {
    console.log("ID della nota durante il salvataggio:", noteId);

    const noteToUpdate = notes.find(note => note._id === noteId);
    console.log("note._id:", noteToUpdate._id);

    if (!noteToUpdate) {
        console.error("Nota non trovata");
        return;
    }

    console.log("Nota da aggiornare:", noteToUpdate);

    // Before updating the note, check if there are tasks with deadlines to add as activities
    if (noteData.isTodo) {
      console.log("Adding tasks as activities...");

      console.log("Stato delle activities:", activities);
      
  noteData.tasks.forEach(task => {
    if (task.deadline) {
      // check if the task is already an activity
      const activityExists = activities.some(activity => 
        activity.title === task.text && activity.deadline === task.deadline
      );

      if (!task.completed && !activityExists) {
        // add a new activity to the calendar
        const activityData = {
          title: task.text,
          deadline: task.deadline,
          type: 'activity',
        };

        setActivities(prevActivities => [
          ...prevActivities,
          activityData
        ]);
        console.log("Adding activity:", activityData);

        handleAddData(null, activityData, setActivities, activities, setActivities, setIsEditing);

      } else if (task.completed && activityExists) {
        console.log("Stato delle activities:", activities);
        // remove the activity from the calendar
        const activityToDelete = activities.find(activity => 
          activity.title === task.text && activity.deadline === task.deadline
        );

        if (activityToDelete) {
          console.log("Attività da eliminare:", activityToDelete);
          setActivities(prevActivities => 
            prevActivities.filter(activity => activity._id !== activityToDelete._id)
          );
          handleDeleteData( 'activity', activityToDelete._id, activities, setActivities);
          console.log(`Attività per il task "${task.text}" è stata eliminata.`);
        }
      } else {
        console.log(`No change for task "${task.text}", skipping.`);
      }
    }
  });
}
    const updatedNote = {
      ...noteToUpdate.note,
      title: noteData.title,
      noteAuthor: noteData.noteAuthor,
      noteAccess: noteData.noteAccess, 
      allowedUsers: noteData.noteAccess === 'restricted' ? noteData.allowedUsers : [], // Add allowed users if restricted
      category: noteData.category,
      content: noteData.content,
      tasks: noteData.tasks,
      updateDate: new Date() // updates the modify date
    };
    try {
      const response = await fetch(`http://localhost:8000/api/note/${noteId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedNote),
          credentials: 'include'
      });

      if (!response.ok) {
          throw new Error("Error while updating note");
      }

      const updatedNotes = notes.map(note =>
        note._id === noteId ? { note: updatedNote } : note
      );
      setNotes(updatedNotes);
      fetchNotes(setNotes);
      console.log("Updated Notes:", updatedNotes);
      setIsEditing(null); // exit from edit mode
      //resetting fields
      handleNoteDataChange('title', '', setNoteData);
      handleNoteDataChange('category', '', setNoteData);
      handleNoteDataChange('content', '', setNoteData);
      handleNoteDataChange('noteAccess', 'public', setNoteData);
      handleNoteDataChange('isTodo', false, setNoteData);
      handleNoteDataChange('tasks', [], setNoteData);
    } catch (error) {
      console.error("Errore nell'aggiornamento della nota:", error);
  }
};

//Function to sort the nots for the selected sort criterion
export function sortNotes(notes, sortCriterion) {
  if (!Array.isArray(notes)) {
    console.error('Notes array not found');
    return [];
  }
  return [...notes].sort((a, b) => {
    const aDate = a.updateDate instanceof Date ? a.updateDate : new Date(a.updateDate);
    const bDate = b.updateDate instanceof Date ? b.updateDate : new Date(b.updateDate);
    
    switch (sortCriterion) {
      case 'alphabetical':
        const aTitle = a.title || '';
        const bTitle = b.title || '';
        return aTitle.localeCompare(bTitle);
      case 'length':
        const aContentLength = a.content ? a.content.length : 0;
        const bContentLength = b.content ? b.content.length : 0;
        return bContentLength - aContentLength;
      case 'most_recent':
        return bDate - aDate;
      case 'least_recent':
        return aDate - bDate;
      default:
        return 0;
    }
  });
}

//Function to handle resetting fields of the form
export async function handleResetForm (setNoteData) {
  handleNoteDataChange('title', '', setNoteData);
  handleNoteDataChange('category', '', setNoteData);
  handleNoteDataChange('content', '', setNoteData);
  handleNoteDataChange('noteAccess', 'public', setNoteData);
  handleNoteDataChange('isTodo', false, setNoteData);
  handleNoteDataChange('tasks', [], setNoteData);
}

//Function to handle the creation of a new note
export async function handleAddNote (noteData, setNoteData, notes, setNotes) {

  if (!noteData.title || !noteData.category) {
    popUpAlert('Add Note Error', 'Missing required fields', 'error');
    console.log(noteData);
    return;
  }
  
  if (noteData.isTodo && noteData.tasks.length === 0) {
    popUpAlert('Add Note Error', 'Please add at least one task to your to-do list', 'error');
    return;
  } else if (!noteData.isTodo && (!noteData.content || noteData.content.trim() === "")) {
    popUpAlert('Add Note Error', 'Please add content to your note', 'error');
    return;
  }

  const newNote = {
    ...noteData,
    content: noteData.content.trim(),
    allowedHost: noteData.noteAccess === 'restricted' ? noteData.allowedHost : [],
    tasks: noteData.isTodo 
    ? noteData.tasks.map(task => (task._id)) : [],
    createDate: noteData.createDate ? new Date(noteData.createDate) : new Date(),
    updateDate: noteData.updateDate ? new Date(noteData.updateDate) : new Date(),
  }


  try {
    const response = await fetch('http://localhost:8000/api/note', {
      method: 'POST',
      credentials: "include",
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

    if (savedNote) {
      setNotes([...notes, savedNote.note ]);
      handleResetForm(setNoteData);
    }
  } catch(error) {
    console.error('Error while adding note:', error);
  }

}

//Function to save the edit of a note
export async function handleSaveEditNote(noteId, notes, setNotes, noteData, setNoteData, setIsEditing) {

  const noteToUpdate = notes.find(note => note._id === noteId);

  if (!noteToUpdate) {
    console.error("Nota non trovata");
    return;
  }

  const updatedNote = {
    ...noteToUpdate.note,
    title: noteData.title,
    noteAccess: noteData.noteAccess,
    allowedUsers: noteData.noteAccess === 'restricted' ? noteData.allowedUsers : [],
    category: noteData.category,
    content: noteData.content,
    tasks: noteData.isTodo 
    ? noteData.tasks.map(task => ({ 
      ...task,
      completed: task.completed || false,
      deadline: task.deadline || null
    })) : [],
    updateDate: new Date()
  };

  try {
    const response = await fetch(`http://localhost:8000/api/note/${noteId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedNote)
    });

    if (!response.ok) {
      throw new Error('Error while updating note');
    }

    const savedNote = await response.json();


    if (savedNote) {
      const updatedNotes = notes.map(note =>
        note._id === noteId ? { note: savedNote } : note
      );
  
      setNotes(updatedNotes);
      setIsEditing(null);
      handleResetForm(setNoteData);
    }
  } catch (error) {
    console.error('Error while saving note:', error);
  }
};

//Function to handle the deletion of a note
//TODO: Check why this is not working with toDoList
export function handleCopyContent(content) {
  navigator.clipboard.writeText(content).then(() => {
    popUpAlert('Contenuto copiato', 'Il contenuto è stato copiato negli appunti', 'success');
  });
};

function popUpAlert(title, message, icon) {
  Swal.fire({
    title: title,
    icon: icon,
    text: message,
    customClass: {
      confirmButton: 'button-alert'
    }
  });
}

// Get the username of the authenticated user
export async function fetchUsername() {
  try {
    const response = await fetch('http://localhost:8000/api/user/username', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error while fetching user');
    }

    const data = await response.json();
    return data.username;
  } catch (error) {
    console.error('Error while fetching user:', error);
  }
}

