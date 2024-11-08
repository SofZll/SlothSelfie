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
    const { id } = req.params;
    const { title, category, content, noteAccess, allowedUsers, isTodo, tasks, taskDeadline } = req.body;
    try {
        const note = await Note.findByIdAndUpdate(
            { _id: id, noteAuthor: req.session.userId }, // Verify that the note belongs to the user
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

// Duplicate a note
const duplicateNote = async (req, res) => {
    const { noteId } = req.body;
    try {
        // find the note to duplicate
        const existingNote = await Note.findById(noteId);
        if (!existingNote) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // creates the duplicated note
        const duplicatedNote = new Note({
            ...existingNote.toObject(),
            _id: undefined,  // Rremoves the _id field, mongo will create a new one
            createDate: new Date(),
            updateDate: new Date(),
        });

        await duplicatedNote.save();
        res.status(201).json({ success: true, note: duplicatedNote });
    } catch (error) {
        console.error('Error duplicating note:', error);
        res.status(500).json({ success: false, message: 'Error duplicating note' });
    }
};

module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    duplicateNote,
};
