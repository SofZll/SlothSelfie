const mongoose = require('mongoose');

const timeMachineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    date: {
        type: Date,
        required: true
    },  // "YYYY-MM-DD"
    time: {
        type: String,
        required: true
    }   // "HH:MM"
});

const TimeMachine = mongoose.model('TimeMachine', timeMachineSchema);
module.exports = TimeMachine;