const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const defaultImage = path.join(__dirname, '../defaultImage.jpg');

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
    }
}, {
    timestamps: true,
});

userSchema.pre('save', function (next) {
    if (!this.image.data) {
        this.image.data = fs.readFileSync(defaultImage);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;