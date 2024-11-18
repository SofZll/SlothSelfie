const Note = require('../models/noteModel');

// Create a new note
const createNote = async (req, res) => {
    const {title, category, content, noteAccess, noteAuthor, allowedUsers, isTodo, tasks, taskDeadline } = req.body;
    try {
        const note = new Note({
            title,
            category,
            content,
            noteAuthor,
            noteAccess,
            allowedUsers: noteAccess === 'restricted' ? allowedUsers : [],
            isTodo,
            tasks,
            createDate: new Date(),
            updateDate: new Date(),
        });
        await note.save();
        res.status(201).json({ success: true, note });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, message: 'Error creating note' });
    }
};

// Fetch all notes
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ noteAuthor: req.session.userId });
        res.status(200).json({ success: true, notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, message: 'Error fetching notes' });
    }
};

// Update a note
const updateNote = async (req, res) => {
    const { noteId } = req.params;
    console.log('ID della nota:', noteId);
    console.log('ID dell\'utente:', req.session.userId);
    const { title, category, content, noteAccess, allowedUsers, isTodo, tasks, taskDeadline } = req.body;
    const note = await Note.findById(noteId);
    if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
    }
    if (note.noteAuthor.toString() !== req.session.userId) {
        return res.status(403).json({ success: false, message: 'You are not authorized to edit this note' });
    }
    try {
        const note = await Note.findOneAndUpdate(
            { _id: noteId }, // TODO: Verify that the note belongs to the user{_id: noteId, noteAuthor: req.session.userId}
            { title, category, content, noteAccess, allowedUsers, isTodo, tasks, taskDeadline },
            { new: true }
        );

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.status(200).json({ success: true, note });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Error updating note' });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    const { noteId } = req.params;
    try {
        const note = await Note.findByIdAndDelete(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.status(200).json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, message: 'Error deleting note' });
    }
};

module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
};
