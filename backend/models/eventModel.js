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

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    status: [{
        type: String,
        enum: ['accepted', 'declined', 'waiting'],
        required: function() {
            return this.sharedWith.length > 1;
        }
    }],

    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    allDay: { 
        type: Boolean,
        required: true,
        default: false,
    },

    repeatFrequency: {
        type: String,
        default: 'none',
        required: true,
    },
    repeatEndDate: {
        type: Date,
        default: null,
    },

    eventLocation: {
        type: String,
        default: null,
    },

    isInProject: {  //used to differentiate between normal events and project-activity events
        type: Boolean,
        default: false,
    },

    pomodoro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pomodoro',
        default: null
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
