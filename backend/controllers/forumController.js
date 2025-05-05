const Content = require('../models/contentModel')
const User = require('../models/userModel');

const { getCurrentNow } = require('../services/timeMachineService');

// Create post
const createPost = async (req, res) => {
    const now = getCurrentNow();
    const userId = req.session.userId;
    const { text, latitude, longitude } = req.body;
    const image = req.file;

    if (!userId || !text) return res.status(400).json({ success: false, message: 'Missing required fields'});

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const newPost = new Content({
            author: user._id,
            type: 'post',
            date: new Date().toISOString(),
            text: text,
            image: image ? { data: image.buffer, contentType: image.mimetype } : null,
            location: {
                latitude: latitude || null,
                longitude: longitude || null,
            },
            comments: [],
            createdAt: now,
        });

        const savedPost = await newPost.save();
        res.status(201).json({ success: true, post: savedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Error creating post' });
    }
};

// Create comment
const createComment = async (req, res) => {
    const now = getCurrentNow();
    const userId = req.session.userId;
    const { text, postId } = req.body;
    const post = await Content.findById(postId);

    if (!userId || !text || !postId) return res.status(400).json({ success: false, message: 'Missing required fields'})

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const newComment = new Content({
            author: user._id,
            type: 'comment',
            date: new Date().toISOString(),
            text: text,
            associatedPost: post._id,
            createdAt: now,
        });

        const savedComment = await newComment.save();
        await Content.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        res.status(201).json({ success: true, comment: savedComment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ success: false, message: 'Error creating comment' });
    }

};

// Fetch all the posts
const getPosts = async (req, res) => {
    const now = getCurrentNow();
    try {
        const posts = await Content.find({ type: 'post', createdAt: { $lte: now } })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username image',
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username',
                }
            });
        
        res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
};

// Update content
const updateContent = async (req, res) => {
    const { contentId } = req.params;
    const { likes } = req.body;

    try {
        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            { likes },
            { new: true }
        );

        if (!updatedContent) return res.status(404).json({ success: false, message: 'Content not found' });

        res.status(200).json({ success: true, content: updatedContent });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ success: false, message: 'Error updating content' });
    }
}

module.exports = {
    createPost,
    createComment,
    getPosts,
    updateContent,
}