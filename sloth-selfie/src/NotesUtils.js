import { a } from "react-spring";

// Function to handle changes in note data
export function handleNoteDataChange (field, value, setNoteData) {
  setNoteData((prevEventData) => ({
      ...prevEventData,
      [field]: value
  }));
  };

export function canUserAccess(note, currentUser) {
    if (!note.access) {
        return false; // if no access is defined, the note is private
    }
    if (note.access.type === 'public') {
      return true;  // open to everyone
    }
    if (note.access.type === 'private') {
      return note.author === currentUser;  //only the author can access
    }
    if (note.access.type === 'restricted') {
        //Verify if allowedUsers is an array and if it contains the current user
        //console.log('Allowed Users:', note.access.allowedUsers);
        return Array.isArray(note.access.allowedUsers) && 
               note.access.allowedUsers.includes(currentUser);
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

export function handleDuplicateNote (index, notes, setNotes) {
    const noteToDuplicate = notes[index];
    const duplicatedNote = { ...noteToDuplicate, date: new Date() }; // Duplicate with a new date
    setNotes([...notes, duplicatedNote]);
  };

export function handleDeleteNote(index, notes, setNotes) {
    setNotes(notes.filter((_, i) => i !== index));
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
  handleNoteDataChange('noteAccess', notes[index].access.type, setNoteData);
  handleNoteDataChange('allowedUsers', notes[index].access.allowedUsers, setNoteData);
  handleNoteDataChange('isTodo', notes[index].isTodo, setNoteData);
  handleNoteDataChange('tasks', notes[index].tasks, setNoteData);
  }
};

export function handleSaveEdit(index, notes, setNotes, noteData, setNoteData, setIsEditing) {
    const updatedNote = {
      ...notes[index],
      title: noteData.title,
      author: noteData.noteAuthor,
      access: { 
        type: noteData.noteAccess, 
        allowedUsers: noteData.noteAccess === 'restricted' ? noteData.allowedUsers : [] // Add allowed users if restricted
      },
      category: noteData.category,
      content: noteData.content,
      tasks: noteData.tasks,
      updateDate: new Date() // updates the modify date
    };

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