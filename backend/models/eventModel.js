const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    originalId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    allDay: { 
        type: Boolean,
        default: false,
    },
    repeatFrequency: {
        type: String,
        default: 'none',
    },
    repeatEndDate: {
        type: Date,
        default: null,
    },
    EventLocation: {
        type: String,
        default: null,
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
