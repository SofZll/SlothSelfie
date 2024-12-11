const Note = require('../models/noteModel');
const User = require('../models/userModel');
const  { createTask, getTasks, updateTask, deleteTask, getTaskById } = require('./taskController');

// Create a new note
const createNote = async (req, res) => {
    const {title, category, content, noteAccess, noteAuthor, allowedUsers, isTodo, tasks } = req.body;
    const newTasks = [];

    if (isTodo) {
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const newTask = await createTask(task);
            newTasks.push(newTask._id);
        }
    }

    try {
        const note = new Note({
            title,
            category,
            content,
            noteAuthor,
            noteAccess,
            allowedUsers: noteAccess === 'restricted' ? allowedUsers : [],
            isTodo,
            tasks: isTodo ? newTasks : [],
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
        const notes = await Note.find({ username: req.session.username });
        res.status(200).json({ success: true, notes });
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
        if (note.noteAuthor.toString() !== currentUser.username) {
            return res.status(403).json({ success: false, message: 'You are not authorized to edit this note' });
        }

        // Update the note
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { title, category, content, noteAccess, allowedUsers, isTodo, tasks, taskDeadline },
            { new: true }
        );

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

    if (isTodo) {
        for (let i = 0; i < note.tasks.length; i++) {
            const taskId = note.tasks[i];
            await deleteTask(taskId);
        }
    }
        
    try {
        note.deleteOne();
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
