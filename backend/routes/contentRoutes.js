const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { createPost, createComment, getPosts , updateContent} = require('../controllers/forumController');

const router = express.Router();

// forum endpoint
router.post('/forum/new-post', upload.single('image'), createPost);
router.post('/forum/new-comment', createComment);
router.get('/forum/posts', getPosts);
router.put('/forum/update-content', updateContent);

module.exports = router;