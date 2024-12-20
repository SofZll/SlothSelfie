const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    deadline: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    },
    allawedHosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;