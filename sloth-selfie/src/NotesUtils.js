// Function to handle changes in note data
export function handleNoteDataChange (field, value, setNoteData) {
  setNoteData((prevData) => ({
      ...prevData,
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

export async function handleDuplicateNote (noteId, notes, setNotes) {

    const noteToDuplicate = notes
        .map(response => response.note)
        .find(note => note._id === noteId);

    if (!noteToDuplicate) {
        console.error("Nota non trovata per l'ID:", noteId);
        return;
    }

    const noteToDuplicateNoId = { ...noteToDuplicate, _id: null };
    // creates a new note, the backend will assign a new id
    const duplicatedNote = { 
      ...noteToDuplicateNoId, 
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
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
        console.log("Saved duplicated note:", savedNote);

        setNotes([...notes, savedNote]);
    } catch (error) {
        console.error("Errore durante la duplicazione della nota:", error);
    }
  };

export async function handleDeleteNote(noteId, notes, setNotes) {
    if (!noteId) 
      console.error("ID della nota non trovato");

    try {
        const response = await fetch(`http://localhost:8000/api/note/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error while deleting note in backend');
        }

        //updating frontend
        setNotes(notes.filter(note => note.note._id !== noteId));
    } catch (error) {
        console.error('Errore durante l\'eliminazione della nota:', error);
    }
};

export async function handleEditNote(noteId, notes, setNoteData, setIsEditing) {
  const noteToEdit = notes
        .map(response => response.note)
        .find(note => note._id === noteId);

    if (!noteToEdit) {
        console.error("Nota non trovata per l'ID:", noteId);
        return;
    }

    console.log("Editing note with ID:", noteId);
    console.log("Note data:", noteToEdit);
  
  setNoteData({
      ...noteToEdit,
      tasks: noteToEdit.tasks || [], // we prevent errors if undefined
      allowedUsers: noteToEdit.allowedUsers || [] // we prevent errors if undefined
  });
  
  setIsEditing(noteId);
}

export async function handleSaveEdit(noteId, notes, setNotes, noteData, setNoteData, setIsEditing) {
    console.log("ID della nota durante il salvataggio:", noteId);

    const noteToUpdate = notes.find(note => note.note._id === noteId);
    console.log("note._id:", noteToUpdate.note._id);

    if (!noteToUpdate) {
        console.error("Nota non trovata");
        return;
    }

    console.log("Nota da aggiornare:", noteToUpdate);

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
        note.note._id === noteId ? { note: updatedNote } : note
      );
      setNotes(updatedNotes);
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

export function sortNotes(notes, sortCriterion) {
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

  export function handleCopyContent(content) {
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!');
    });
  };