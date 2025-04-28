const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
    },
    content: { 
        type: String 
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    noteAccess: {
        type: String,
        required: true,
        default: 'public',
        enum: ['public', 'private', 'shared']
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    fileLink: { // Optional link to a file for projects
        type: String
    },
    
    isInProject: {  //used to differentiate between normal notes and project-activity notes
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
