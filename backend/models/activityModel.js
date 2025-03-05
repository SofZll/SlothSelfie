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
    sharedWith: [{ //used also for assigning activities to users in projects
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // New fields only for Project-activities 
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null }, // if this field is null, this is a normal activivty

     phase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phase',
        default: null
    }, // if null, the activity has a subphase

    subphase: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subphase', 
        default: null 
    }, // if null, the activity has a phase

    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Activity' 
        }],

    status: {
        type: String,
        enum: ["Not_Activatable", "Activatable", "Active", "Completed", "Reactivated", "Overdue", "Abandoned"],
        default: "Not_Activatable"
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
        type: Boolean, default: false 
    } 

}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;