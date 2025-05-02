const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { createPost, createComment, getPosts , updateContent} = require('../controllers/forumController');

const router = express.Router();

// forum endpoint
router.post('/forum/post', upload.single('image'), createPost);
router.post('/forum/:postId/comment', createComment);
router.get('/forum/posts', getPosts);
router.put('/forum/:contentId', updateContent);

module.exports = router;