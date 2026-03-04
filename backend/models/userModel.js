const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const defaultImagePath = path.join(__dirname, '../media/img/defaultImage.jpg');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
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
            default: 'image/jpeg'
        }
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    disableNotifications: {
        all: {
            type: Boolean,
            default: false
        },
        email: {
            type: Boolean,
            default: false
        },
        system: {
            type: Boolean,
            default: false
        },
        outsideWorkingHours: {
            type: Boolean,
            default: true
        },
        outsideDayHours: {
            type: Boolean,
            default: true
        },
        urgency: {
            type: Boolean,
            default: false
        }
    },

    isAdmin: {
        type: Boolean,
        default: false,
        required: true,
    },
    isRoom: {
        type: Boolean,
        default: false,
    },
    isDevice: {
        type: Boolean,
        default: false,
    },

    workingHours: {
        start: { type: String, required: true, default: '07:00' },
        end: { type: String, required: true, default: '19:00' },
    },

    dayHours: {
        start: { type: String, required: true, default: '06:00' },
        end: { type: String, required: true, default: '21:59' },
    },

    freeDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
        default: ['Saturday', 'Sunday'],
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.pre('save', async function (next) {
    try {
        if (this.isNew && !this.image.data && !this.isRoom && !this.isDevice) {
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