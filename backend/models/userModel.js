const mongoose = require('mongoose');

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
        data: Buffer,
        contentType: String 
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;