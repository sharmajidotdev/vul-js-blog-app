const { addComment } = require('../models/comment');

exports.addComment = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { comment } = req.body;
  addComment({
    postId: req.params.id,
    author: req.session.user.username,
    comment
  }, (err, result) => {
    if (err) {
      console.error('Error adding comment:', err);
      return res.status(500).send('Error adding comment');
    }
    res.redirect('/posts/' + req.params.id);
  });
};