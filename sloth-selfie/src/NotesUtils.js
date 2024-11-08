import { v4 as uuidv4 } from 'uuid'; //to create unic id

// Function to handle changes in note data
export function handleNoteDataChange (field, value, setNoteData) {
  setNoteData((prevEventData) => ({
      ...prevEventData,
      [field]: value
  }));
  };

export function canUserAccess(note, currentUser) {
    console.log('Checking access for note:', note);
    console.log('Current user:', currentUser);
    if (!note.noteAccess) {
        return false; // if no access is defined, the note is private
    }
    if (note.noteAccess === 'public') {
      return true;  // open to everyone
    }
    if (note.noteAccess === 'private') {
      return note.noteAuthor === currentUser;  //only the author can access
    }
    if (note.noteAccess === 'restricted') {
        //Verify if allowedUsers is an array and if it contains the current user
        //console.log('Allowed Users:', note.access.allowedUsers);
        return Array.isArray(note.allowedUsers) && 
               note.allowedUsers.includes(currentUser);
    }

    return false;
  }

  export function addTask(taskText, noteData, setNoteData) {

    if (!Array.isArray(noteData.tasks)) {
      noteData.tasks = [];
    }
  
    const newTask = {
      id: noteData.tasks.length,
      text: taskText,
      completed: false,  // every new task is not completed
      deadline: noteData.taskDeadline || null //if specified we create an activity
    };

    // Aggiorna noteData con il nuovo task
    setNoteData(prevNoteData => ({
      ...prevNoteData,
      tasks: [...prevNoteData.tasks, newTask],
      taskDeadline: ''
    }));
  }

  export function removeTask(taskIndex, noteData, setNoteData) {
    const updatedTasks = noteData.tasks.filter((task, i) => i !== taskIndex);
    setNoteData(prevNoteData => ({
      ...prevNoteData,
      tasks: updatedTasks // Aggiorna l'array di tasks
    }));
};

//marks a task as completed
export function toggleTaskCompletion(taskIndex, noteData, setNoteData) {
  const updatedTasks = noteData.tasks.map((task, i) =>
    i === taskIndex ? { ...task, completed: !task.completed } : task
  );
  handleNoteDataChange('tasks', updatedTasks, setNoteData);
};

export async function handleDuplicateNote (index, notes, setNotes) {
    //const noteToDuplicate = notes[index];
    //const duplicatedNote = { ...noteToDuplicate, date: new Date() }; // Duplicate with a new date
    //setNotes([...notes, duplicatedNote]);
    const noteToDuplicate = notes[index];
    
    // Crea una nuova nota duplicata con la data attuale
    const duplicatedNote = { 
        ...noteToDuplicate, 
        date: new Date(),
        id: uuidv4()
    };

    try {
        //const response = await fetch('/note', {
        //locale:
         const response = await fetch('http://localhost:8000/api/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(duplicatedNote)
        });

        if (!response.ok) {
            throw new Error("Error while duplicating note");
        }
        const savedNote = await response.json();

        setNotes([...notes, savedNote]);
    } catch (error) {
        console.error("Errore durante la duplicazione della nota:", error);
    }
  };

export async function handleDeleteNote(index, notes, setNotes) {
    //setNotes(notes.filter((_, i) => i !== index));
    const noteId = notes[index].id;

    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error while deleting note in backend');
        }

        //updating frontend
        setNotes(notes.filter((_, i) => i !== index));
    } catch (error) {
        console.error('Errore durante l\'eliminazione della nota:', error);
    }
};

export function handleEditNote(index, notes, setNoteData, setIsEditing,) {
  console.log('Editing note at index:', index);
  console.log('Note data:', notes[index]);
  //const index = notes.findIndex(note => note.id === id);
  if (index !== -1) {
  setIsEditing(index);
  handleNoteDataChange('title', notes[index].title, setNoteData);
  handleNoteDataChange('category', notes[index].category, setNoteData);
  handleNoteDataChange('content', notes[index].content, setNoteData);
  handleNoteDataChange('noteAuthor', notes[index].noteAuthor, setNoteData);
  handleNoteDataChange('noteAccess', notes[index].noteAccess, setNoteData);
  handleNoteDataChange('allowedUsers', notes[index].allowedUsers, setNoteData);
  handleNoteDataChange('isTodo', notes[index].isTodo, setNoteData);
  handleNoteDataChange('tasks', notes[index].tasks, setNoteData);
  }
};

export async function handleSaveEdit(index, notes, setNotes, noteData, setNoteData, setIsEditing) {
    const updatedNote = {
      ...notes[index],
      title: noteData.title,
      author: noteData.noteAuthor,
      noteAccess: noteData.noteAccess, 
      allowedUsers: noteData.noteAccess === 'restricted' ? noteData.allowedUsers : [], // Add allowed users if restricted
      category: noteData.category,
      content: noteData.content,
      tasks: noteData.tasks,
      updateDate: new Date() // updates the modify date
    };
    try {
      const response = await fetch(`/note/${updatedNote._id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedNote)
      });

      if (!response.ok) {
          throw new Error("Error while updating note");
      }
      const updatedNotes = [...notes];
      updatedNotes[index] = updatedNote;
      setNotes(updatedNotes);
      console.log("Updated Notes:", updatedNotes);
      setIsEditing(null); // exit from edit mode
      handleNoteDataChange('title', '', setNoteData);
      handleNoteDataChange('category', '', setNoteData);
      handleNoteDataChange('content', '', setNoteData);
      handleNoteDataChange('noteAuthor', '', setNoteData);
      handleNoteDataChange('noteAccess', 'public', setNoteData);
      handleNoteDataChange('allowedUsers', [], setNoteData);
      handleNoteDataChange('isTodo', false, setNoteData);
      handleNoteDataChange('tasks', [], setNoteData);
    } catch (error) {
      console.error("Errore nell'aggiornamento della nota:", error);
  }
};

export function sortNotes(notes, sortCriterion) {
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

  export function handleCopyContent(content) {
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!');
    });
  };