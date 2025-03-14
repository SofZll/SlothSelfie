const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
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
    isPreciseTime: {
        type: Boolean,
        default: false,
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
    eventLocation: {
        type: String,
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notify: {
        type: Boolean,
        default: false
    },
    notificationTime: {
        type: Number,
        default: 0
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isInProject: {  //used to differentiate between normal events and project-activity events
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
