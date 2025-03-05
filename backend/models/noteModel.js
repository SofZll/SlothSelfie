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
    noteAccess: {
        type: String,
        default: 'public',
    },
    fileLink: { // Optional link to a file for projects
        type: String
    },
    allowedUsers: [{
        type: String,
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
    createDate:{
        type: Date,
        default: Date.now
    },
    updateDate:{
        type: Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
