const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    element: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'elementType',
        required: true
    },

    elementType: {
        type: String,
        required: true,
        enum: ['Event', 'Activity'] // add se la notifica è per qualche altro tipo di elemento
    },

    type: {
        type: String,
        enum: ['default', 'repeat', 'now'],
        required: true
    },

    mode: {
        email: {
            type: Boolean,
            default: false
        },

        system: {
            type: Boolean,
            default: true
        }
    },

    urgency: {
        type: Boolean,
        default: false
    },

    urgencySettings: {
        frequency: {
            type: String,
            enum: ['1h', '6h', '1d'],
            default: '1d'
        }
    },

    snooze: {
        type: Boolean,
        default: false,
    },

    snoozeSettings: {
        until: {
            type: Date,
            default: null
        },
        count: {
            type: Number,
            default: 0,
            min: 0,
            max: 3
        }
    },

    snoozeFather: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        default: null
    },
    
    // se l'utente è vicino al luogo
    location: {
        lat: Number,
        long: Number,
        radius: Number
    },

    // se il tipo è default indica il tempo prima dell'evento in cui inviare la notifica
    // se il tipo è repeat indica ogni quanto inviare la notifica
    variant: {
        type: String,
        enum: ['minute', 'hour', 'day', 'week'],
    },

    before: {
        type: Number,
        min: 0,
        max: 30
    },

    // for type default
    time: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    from: {
        type: Date,
    },

    // tutti i tipi
    to: {
        type: Date,
    },

    triggerAt: {
        type: Date,
        default: null
    },

    lastSentAt: {
        type: Date,
        default: null,
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: false
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;