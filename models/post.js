const db = require('../config/database');

module.exports = {
  // Intentionally vulnerable for demonstration
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM posts WHERE id = ${id}`;
      db.query(query, (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  },

  createPost: (title, content, userId) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
      db.query(query, [title, content, userId], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  listPosts: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT posts.*, users.username as author FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC';
      db.query(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
};