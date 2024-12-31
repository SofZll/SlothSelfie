const Note = require('../models/noteModel');
const User = require('../models/userModel');
const  { deleteTasks } = require('./taskController');

// Create a new note
const createNote = async (req, res) => {
    const {title, category, content, noteAccess, allowedUsers, isTodo, tasks, C } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });


    try {

        const note = new Note({
            title,
            category,
            content,
            noteAccess,
            allowedUsers: noteAccess === 'restricted' ? allowedUsers : [],
            isTodo,
            tasks: isTodo ? tasks : [],
            createDate: new Date(),
            updateDate: new Date(),
            user: user._id,
            sharedWith,
        });

        await note.save();
        const savedNote = await Note.findById(note._id).populate('tasks');
        res.status(201).json({ success: true, note: savedNote });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, message: 'Error creating note' });
    }
};

// Fetch all notes
const getNotes = async (req, res) => {

    try {
        const userName = req.session.username;
        const user = await User.findOne({ username: userName });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const notes = await Note.find({
            $or: [
                { user: user._id },
                { noteAccess: 'public' },
                { noteAccess: 'restricted', allowedUsers: user.username },
            ]
        }).populate('tasks').populate('user', 'username').populate('sharedWith', 'username');


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

module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
};
