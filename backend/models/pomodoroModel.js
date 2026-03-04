const mongoose = require('mongoose');

const pomodoroSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Pomodoro',
        required: true
    },

    studyTime: {
        type: Number,
        required: true
    },
    breakTime: {
        type: Number,
        required: true
    },
    additionalCycles: {
        type: Number,
        default: 0
    },
    cycles: {
        type: Number,
        required: true
    },
    isStudyTime: {
        type: Boolean,
    },
    cyclesLeft: {
        type: Number
    },
    studiedTime: {
        type: Number,
        required: true,
        default: 0
    },
    started: {
        type: Boolean,
        required: true,
        default: false
    },
    finished: {
        type: Boolean,
        required: true,
        default: false
    },

    deadline: {
        type: Date
    },
    finishedDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Pomodoro = mongoose.model('Pomodoro', pomodoroSchema);

module.exports = Pomodoro;