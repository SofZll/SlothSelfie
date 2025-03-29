const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    isDirectMessage: {
        type: Boolean,
        default: true
    },

    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: Date,

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

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

chatSchema.virtual('unreadCount', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chat',
    count: true
});

chatSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

chatSchema.statics.findOrCreateDirectChat = async function(user1Id, user2Id) {
    const chat = await this.findOne({
        isDirectMessage: true,
        participants: { $all: [user1Id, user2Id], $size: 2 }
    });

    if (chat) return chat;

    return this.create({
        participants: [user1Id, user2Id]
    });
};

module.exports = mongoose.model('Chat', chatSchema);