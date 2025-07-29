const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.get('/', postController.listPosts);
router.get('/new', postController.showNewPost);
router.post('/new', postController.createPost);
router.get('/:id', postController.showPost);
router.post('/:id/comment', commentController.addComment);

module.exports = router;