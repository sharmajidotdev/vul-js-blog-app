const db = require('../config/database');

exports.listPosts = (req, res) => {
  // Vulnerable query - for demonstration
  db.query('SELECT posts.*, users.username as author FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC', (err, posts) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).send('Error fetching posts');
    }
    res.render('posts', { posts, title: 'Blog Posts' });
  });
};

exports.showNewPost = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('newpost', { error: null, title: 'New Post' });
};

exports.createPost = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { title, content } = req.body;
  if (!title || !content) return res.render('newpost', { error: 'All fields required', title: 'New Post' });

  // Insert new post
  const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, content, req.session.user.id], (err, result) => {
    if (err) {
      console.error('Error creating post:', err);
      return res.render('newpost', { error: 'Error creating post', title: 'New Post' });
    }
    res.redirect('/posts');
  });
};

exports.showPost = (req, res) => {
  // Vulnerable query - for demonstration
  const postQuery = `
    SELECT posts.*, users.username as author 
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    WHERE posts.id = ${req.params.id}
  `;

  db.query(postQuery, (err, posts) => {
    if (err || !posts.length) {
      console.error('Error fetching post:', err);
      return res.status(404).send('Post not found');
    }

    const post = posts[0];
    
    // Get comments for the post - Using parameterized query for comments
    const commentsQuery = `
      SELECT c.id, c.content, c.created_at, c.post_id, u.username as author 
      FROM comments c 
      LEFT JOIN users u ON u.id = c.user_id 
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `;

    console.log('Post ID being queried:', post.id);
    db.query(commentsQuery, [post.id], (err, comments) => {
      if (err) {
        console.error('Error fetching comments:', err);
        comments = [];
      }
      // console.log('Post ID:', post.id, 'Type:', typeof post.id);
      // console.log('Number of comments found:', comments ? comments.length : 0);
      // console.log('First comment if any:', comments && comments.length > 0 ? comments[0] : 'No comments');
      // console.log('Comments query:', commentsQuery.replace('?', post.id));
      res.render('post', { post, comments, title: post.title });
    });
  });
};