const Content = require('./contentModel')

// Create post
const createPost = async (req, res) => {
    const {author, text} = req.body;

    if (!author || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields'})
    }

    try {
        const newPost = new Content({
            author: author,
            type: 'post',
            date: new Date(),
            text: text,
            comments: [],
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
    const {author, text, postId} = req.body;

    if (!author || !text || !postId) {
        return res.status(400).json({ success: false, message: 'Missing required fields'})
    }

    try {
        const newComment = new Content({
            author: author,
            type: 'comment',
            date: new Date(),
            text: text,
            associatedPost: postId,
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

module.export = {
    createPost,
    createComment
}