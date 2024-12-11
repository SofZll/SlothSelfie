const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { createPost, createComment, getPosts , updateContent} = require('../controllers/hubController');

const router = express.Router();

// Hub endpoint
router.post('/hub/new-post', upload.single('image'), createPost);
router.post('/hub/new-comment', createComment);
router.get('/hub/posts', getPosts);
router.put('/hub/update-content', updateContent);

module.exports = router;