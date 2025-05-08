const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['personal', 'work', 'social', 'other'],
        default: 'personal',
        required: true,
    },

    repeatFrequency: {
        type: String,
        default: 'none',
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        required: true,
    },
    repeatEndDate: {
        type: Date,
        default: null,
    },
    repeatTimes: {
        type: Number,
        default: 0,
    },
    fatherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: null
    },

    eventLocation: {
        type: String,
        enum: ['physical', 'virtual'],
        default: null,
    },

    isInProject: {  //used to differentiate between normal events and project-activity events
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
