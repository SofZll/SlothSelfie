const Note = require('../models/noteModel');
const User = require('../models/userModel');

const { addTasks, editTasks, deleteTasks, deleteUserFromShareWith } = require('./taskController');
const { findUserId } = require('../utils/utils');
const { getCurrentNow } = require('../services/timeMachineService');

// Create a new note
const createNote = async (req, res) => {
    const { title, category, content, tasks, noteAccess, sharedWith } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const now = getCurrentNow();

    try {
        const users = await findUserId(sharedWith);

        const note = new Note({
            title,
            user: user._id,
            category,
            content: content || '',
            noteAccess,
            sharedWith: noteAccess === 'shared' ? users : [],
            createdAt: now,
            updatedAt: now
        });
        
        if (tasks) note.tasks = await addTasks(tasks, user, users);

        const savedNote = await note.save()

        const populatedNote = await Note.findById(savedNote._id)
        .populate('user', 'username')
        .populate('tasks')
        .populate('sharedWith', 'username');
        
        res.status(201).json({ success: true, note: populatedNote });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, message: 'Error creating note' });
    }
};

// Fetch all notes
const getNotes = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const now = getCurrentNow();

    try {
        
        const notes = await Note.find({
            $or: [
                { user: user._id },
                { noteAccess: 'public' },
                { noteAccess: 'shared', sharedWith: user._id }
            ],
            createdAt: { $lte: now }
        })
        .populate('tasks')
        .populate('user', 'username')
        .populate('sharedWith', 'username');

        res.status(200).json({ success: true, notes });

    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, message: 'Error fetching notes' });
    }
};

// Fetch a single note by ID
const getNote = async (req, res) => {
    const { noteId } = req.params;
    const now = getCurrentNow();

    try{
        const note = await Note.findById(noteId)
        .populate('user', 'username')
        .populate('tasks')
        .populate('sharedWith', 'username');

        console.log('Note:', note);
        console.log('Current time:', now);
        if (note.createdAt > now) return res.status(403).json({ success: false, message: 'Note not found' }); //MI DA 403 FORBIDDEN

        res.status(200).json({ success: true, note });
    } catch (error) {
        console.error('Error fetching note:', error);
        return res.status(500).json({ success: false, message: 'Error fetching note' });
    }
}

// Update a note
const updateNote = async (req, res) => {
    const { noteId } = req.params;
    const { title, user, category, content, tasks, addedTasks, deletedTasks, noteAccess, sharedWith } = req.body;

    try {
        const note = await Note.findById(noteId);
        const users = await findUserId(sharedWith);
        const userId = await User.findOne({ username: user});

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        if (deletedTasks) {
            const response = await deleteTasks(deletedTasks);
            if (!response) return res.status(500).json({ success: false, message: 'Error deleting tasks' });
        }

        if (addedTasks) {
            const response = await addTasks(addedTasks, userId, users);
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
        note.updatedAt = new Date();
        note.sharedWith = noteAccess === 'shared' ? users : [];

        const updatedNote = await note.save();

        const populatedNote = await Note.findById(updatedNote._id)
        .populate('user', 'username')
        .populate('tasks')
        .populate('sharedWith', 'username');

        res.status(200).json({ success: true, note: populatedNote });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Error updating note' });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    const { noteId } = req.params;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
        
    try {
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        if (note.user._id.toString() !== user._id.toString() && note.noteAccess === 'shared') {

            note.sharedWith = note.sharedWith.filter(sharedUser => sharedUser.toString() !== user._id.toString());

            if (note.tasks.length > 0) {
                const response = await deleteUserFromShareWith(user._id, note.tasks);
                if (!response) return res.status(500).json({ success: false, message: 'Error deleting user from task share with' });
            }
            await note.save();
        } else if (note.user._id.toString() !== user._id.toString() && note.noteAccess === 'public') {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this note' });
        } else {

            if (note.tasks.length > 0) {
                const response = await deleteTasks(note.tasks);
                if (!response) return res.status(500).json({ success: false, message: 'Error deleting tasks' });
            }

            await Note.findByIdAndDelete(noteId);
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
    getNote,
    updateNote,
    deleteNote
};
