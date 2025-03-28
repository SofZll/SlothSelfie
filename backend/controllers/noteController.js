const Note = require('../models/noteModel');
const User = require('../models/userModel');
const  { deleteTasks } = require('./taskController');

const { addTasks } = require('./taskController');
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

        res.status(200).json(notes);

    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, message: 'Error fetching notes' });
    }
};

// Update a note
const updateNote = async (req, res) => {
    const { noteId } = req.params;
    const { title, category, content, noteAccess, allowedUsers, isTodo, tasks, taskDeadline } = req.body;


    const note = await Note.findById(noteId);
    if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (isTodo) {
        for (let i = 0; i < note.tasks.length; i++) {
            const task = await getTaskById(note.tasks[i]);
            if (!task) {
                //create a new task
                const newTask = await createTask(tasks[i]);
                tasks[i] = newTask._id;
                note.tasks.push(newTask._id);
            } else {
                //update the task
                await updateTask(note.tasks[i], tasks[i]);
            }
        }
    }

    try{
        //we find the current user and check if it is the author of the note
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        if (note.user.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to edit this note' });
        }

        // Update the note
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { title, category, content, noteAccess, allowedUsers, isTodo, tasks, taskDeadline },
            { new: true }
        ).populate('user', '_id username').populate('tasks');

        res.status(200).json({ success: true, note: updatedNote });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Error updating note' });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
        
    try {
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // Delete all tasks associated with the note
        if (note.isTodo) {
            const tasksDeleted = await deleteTasks(note.tasks);
            if (!tasksDeleted) {
                return res.status(500).json({ success: false, message: 'Error deleting tasks' });
            }
        }

        await Note.findByIdAndDelete(noteId);
        res.status(200).json({ success: true, message: 'Note deleted successfully' });

    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, message: 'Error deleting note' });
    }
};

//Get a note by id
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ error: "Nota non trovata" });
        }
        res.json(note);
    } catch (error) {
        console.error("Errore nel recuperare la nota:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    getNoteById
};
