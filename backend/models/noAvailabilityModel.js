const mongoose = require('mongoose');

const noAvailabilitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    days: {
        type: Boolean,
        required: true,
    },
    repeatFrequency: { 
        type: String, 
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], 
        default: 'none',
        required: true,
    },
    numberOfOccurrences: {
        type: Number,
    },
    fatherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NoAvailability',
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }
}, { timestamps: true });

const NoAvailability = mongoose.model('NoAvailability', noAvailabilitySchema);

module.exports = NoAvailability;
