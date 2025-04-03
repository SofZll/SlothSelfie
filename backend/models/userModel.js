const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const defaultImagePath = path.join(__dirname, '../media/img/defaultImage.jpg');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
    },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
    },
    image: {
        data: {
            type: Buffer,
            default: null,
        },
        contentType: {
            type: String,
            default: 'image/jpeg',
        },
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    
    noAvailability: [{
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        repeatFrequency: { 
            type: String, 
            enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], 
            default: 'none',
            required: true,
        },
        numberOfOccurrences: {
            type: Number,
        }
    }],

    workingHours: {
        start: { type: String, required: true, default: '09:00' }, // HH:MM
        end: { type: String, required: true, default: '17:00' }, // HH:MM
    },

    freeDays: {
        type: [String], // Array of strings declaring free days in the week
        default: ['Saturday', 'Sunday'],
    }

}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    try {
        if (this.isNew && !this.image.data) {
            // Only set default if new user and no image provided
            const defaultImgData = await fs.readFile(defaultImagePath);
            console.log("Default image data length:", defaultImgData.length);
            this.image.data = defaultImgData;
            this.image.contentType = 'image/jpeg';
        }
        next();
    } catch (error) {
        console.error('Error loading default image:', error);
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;