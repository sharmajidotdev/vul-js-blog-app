const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/posts/:id/comment', commentController.addComment);

module.exports = router;