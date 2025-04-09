const Note = require('../models/noteModel');
const User = require('../models/userModel');

const { addTasks, editTasks, deleteTasks } = require('./taskController');
const { findUserId } = require('../utils/utils');

// Create a new note
const createNote = async (req, res) => {
    const { title, category, content, tasks, noteAccess, sharedWith } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const users = await findUserId(sharedWith);

        const note = new Note({
            title,
            user: user._id,
            category,
            content: content || '',
            noteAccess,
            sharedWith: noteAccess === 'shared' ? users : [],
            createDate: new Date(),
            updateDate: new Date(),
        });
        
        if (tasks) note.tasks = await addTasks(tasks, user, users);

        const savedNote = await note.save()

        const populatedNote = await Note.findById(savedNote._id)
        .populate('user', 'username')
        .populate('tasks')
        .populate('sharedWith', 'username');
        
        res.status(201).json(populatedNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, message: 'Error creating note' });
    }
};

// Fetch all notes
const getNotes = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        
        const notes = await Note.find({
            $or: [
                { user: user._id },
                { noteAccess: 'public' },
                { noteAccess: 'shared', sharedWith: user._id }
            ]
        })
        .populate('tasks')
        .populate('user', 'username')
        .populate('sharedWith', 'username');

        console.log('Fetched notes:', notes);

        res.status(200).json(notes);

    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, message: 'Error fetching notes' });
    }
};

// Update a note
const updateNote = async (req, res) => {
    const { noteId } = req.params;
    const { title, user, category, content, tasks, addedTasks, deletedTasks, noteAccess, sharedWith } = req.body;

    try {
        const note = await Note.findById(noteId);
        const users = await findUserId(sharedWith);

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        if (deletedTasks) {
            const response = await deleteTasks(deletedTasks);
            if (!response) return res.status(500).json({ success: false, message: 'Error deleting tasks' });
        }

        if (addedTasks) {
            const response = await addTasks(addedTasks, user, users);
            if (!response) return res.status(500).json({ success: false, message: 'Error adding tasks' });
            else note.tasks = response;
        }

        if (tasks) {
            const response = await editTasks(tasks, users);
            if (!response) return res.status(500).json({ success: false, message: 'Error editing tasks' });
            else note.tasks.push(...response);
        }

        note.title = title;
        note.category = category;
        note.content = content;
        note.noteAccess = noteAccess;
        note.updateDate = new Date();
        note.sharedWith = noteAccess === 'shared' ? users : [];

        const updatedNote = await note.save();

        const populatedNote = await Note.findById(updatedNote._id)
        .populate('user', 'username')
        .populate('tasks')
        .populate('sharedWith', 'username');

        res.status(200).json(populatedNote);

    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Error updating note' });
    }


};

// Delete a note
const deleteNote = async (req, res) => {
    const { noteId } = req.params;
        
    try {
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        if (note.tasks.length > 0) {
            const response = await deleteTasks(note.tasks);
            if (!response) return res.status(500).json({ success: false, message: 'Error deleting tasks' });
        }

        await Note.findByIdAndDelete(noteId);
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
    deleteNote
};
