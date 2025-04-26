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
            enum: ['5min', '10min', '15min', '30min'],
            default: '10min'
        },
        max: {
            type: Number,
            default: 3
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
        required: function() {
            return this.type === 'default';
        }
    },

    from: {
        type: Date,
    },

    // tutti i tipi
    to: {
        type: Date,
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
    toObject: { virtuals: true }
});

notificationSchema.index({
    user: 1,
    element: 1,
    elementType: 1,
    type: 1,
    variant: 1,
    before: 1
}, { unique: true });
notificationSchema.index({ status: 1, from: 1, to: 1 }, { unique: true });

notificationSchema.virtual('isActive').get(function() {
    const now = global.virtualNow || new Date();
    if (this.status === 'inactive') return false;
    if (this.type === 'repeat') {
        return this.from <= now && this.to >= now;
    }
    return true;
});

/*const notificationSchema = new mongoose.Schema({
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
*/

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;