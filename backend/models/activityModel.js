const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;