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
    date: {
        type: Date,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    read: {
        type: [Boolean],
        required: true,
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);