const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
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

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    sharedWith: [{ //used also for assigning activities to users in projects
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    responses: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['accepted', 'declined', 'pending'],
            default: 'pending'
        }
    }],

    // New fields only for Project-activities 
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null  // if this field is null, this is a normal activivty
    },
    
    phaseSubphase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhaseSubphase',
        default: null
    },

    isMacroactivity: { // if this is a macroactivity, this field will be true
        type: Boolean,
        default: false
    },

    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity' 
    }],

    status: {
        type: String,
        enum: ['Not_Activatable', 'Activatable', 'Active', 'Completed', 'Reactivated', 'Overdue', 'Abandoned'],
        default: 'Not_Activatable'
    },

    description: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note'
    },

    startDate: {
        type: Date 
    },

    input: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note'
    },
    output: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note'
    },

    milestone: {
        type: Boolean,
        default: false 
    },

    events: [{  // Events related to the activity startDate and deadline
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event'
    }]

}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;