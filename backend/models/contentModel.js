const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new mongoose.Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['post', 'comment'],
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
    location: {
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Content',
    }],
    associatedPost: {
        type: Schema.Types.ObjectId,
        ref: 'Content',
    }
}, {
    timestamps: true,
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;