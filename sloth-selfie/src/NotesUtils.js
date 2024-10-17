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
        console.log('Allowed Users:', note.access.allowedUsers);
        return Array.isArray(note.access.allowedUsers) && 
               note.access.allowedUsers.includes(currentUser);
    }

    return false;
  }

export function handleDuplicateNote (index, notes, setNotes) {
    const noteToDuplicate = notes[index];
    const duplicatedNote = { ...noteToDuplicate, date: new Date() }; // Duplicate with a new date
    setNotes([...notes, duplicatedNote]);
  };

export function handleDeleteNote(index, notes, setNotes) {
    setNotes(notes.filter((_, i) => i !== index));
};

//TODO: adjust for limited access
export function handleEditNote(index, notes, setNoteTitle, setNoteCategory, setNoteContent, setIsEditing) {
  setIsEditing(index);
  setNoteTitle(notes[index].title);
  setNoteCategory(notes[index].category);
  setNoteContent(notes[index].content);
};

export function handleSaveEdit(index, notes, setNotes, noteTitle, noteCategory, noteContent, setIsEditing, setNoteTitle, setNoteCategory, setNoteContent) {
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