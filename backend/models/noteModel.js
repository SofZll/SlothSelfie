const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    content: { 
        type: String 
    },
    noteAuthor: {
        type: String,
        required: true,
    },
    noteAccess: {
        type: String,
        default: 'public',
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isTodo: {
        type: Boolean,
        default: false,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    taskDeadline: {
        type: Date,
        default: null
    },
    createDate:{
        type: Date,
        default: Date.now
    },
    updateDate:{
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
