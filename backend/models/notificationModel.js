const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receivers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['email', 'OS', 'SMS'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    read: {
        type: [Boolean],
        required: false,
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: false,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: false,
    },
    dateNotif: {
        type: Date,
        required: false,
    },
    frequencyNotif: {
        type: String,
        required: false,
    },
    responses: [{
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Accepted', 'Declined', 'Pending'],
            default: 'Pending',
        }
    }]
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;