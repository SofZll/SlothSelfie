const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deadline: {
        type: Date,
        default: null
    },
    completed: {
        type: Boolean,
        default: false
    },
    taskAccess: {
        type: String,
        required: true,
        default: 'public',
        enum: ['public', 'private', 'shared']
    },
    
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]

}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;