const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },

    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    content: {
        text: String,
        /*
        media: [{
            url: String,
            type: {
                type: String,
                enum: ['image', 'video', 'audio', 'file'],
                required: function() { return this.url }
            },
            filename: String,
            size: Number
        }]
            */
    },

    status: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent'
        },
        timestamp: Date
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'status.user': 1 });

module.exports = mongoose.model('Message', messageSchema);