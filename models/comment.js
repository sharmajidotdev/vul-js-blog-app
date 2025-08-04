const db = require('../config/database');

module.exports = {
  addComment: (comment, callback) => {
    db.query(
      'INSERT INTO comments (content, post_id, user_id) SELECT ?, ?, id FROM users WHERE username = ?',
      [comment.comment, comment.postId, comment.author],
      callback
    );
  },
  findByPostId: (postId, callback) => {
    db.query(
      'SELECT c.*, u.username as author FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ?',
      [postId],
      callback
    );
  }
};