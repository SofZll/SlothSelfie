const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
         type: String,
        required: true,
 },
    category: { type: String,
        required: true,
     },
    content: { type: String },
    noteAuthor: {
        type: String,
        required: true,
        },
    noteAccess: {
        type: String, default: 'private'
    },
    allowedUsers: [{
        type: String,
    }],
    isTodo: {
        type: Boolean,
         default: false,
        },
    tasks: [
        {
            id: { type: Number },
            text: { type: String },
            completed: { type: Boolean, default: false },
            deadline: { type: Date, default: null },
        }
    ],
    taskDeadline: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
