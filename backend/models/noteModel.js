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
    }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
