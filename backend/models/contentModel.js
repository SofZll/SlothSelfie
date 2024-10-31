const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    text: {
        type: String,
    },
    likes: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    associated: {
        // Association 0 to N
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Content',
        },
        // Association 1 to 1
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Content',
        }
    }
}, {
    timestamps: true,
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;