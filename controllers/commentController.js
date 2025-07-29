const { addComment } = require('../models/comment');

exports.addComment = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { comment } = req.body;
  addComment({
    postId: req.params.id,
    author: req.session.user.username,
    comment
  });
  res.redirect('/posts/' + req.params.id);
};