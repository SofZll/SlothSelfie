const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        default: this._id,
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
    userName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
