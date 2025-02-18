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
        type: [String],
        enum: ['email', 'OS'],
        default: ['OS'],
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
    element: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'elementType',
        required: false,
    },
    elementType: {
        type: String,
        required: false,
        enum: ['Event', 'Activity'],
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