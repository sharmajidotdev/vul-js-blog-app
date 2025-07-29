const { posts, addPost, findById } = require('../models/post');
const { comments, findByPostId } = require('../models/comment');

exports.listPosts = (req, res) => {
  res.render('posts', { posts, title: 'Blog Posts'  });
};

exports.showNewPost = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('newpost', { error: null , title: 'New Post'  });
};

exports.createPost = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { title, content } = req.body;
  if (!title || !content) return res.render('newpost', { error: 'All fields required' , title: 'New Post' });
  addPost({ id: posts.length + 1, title, content, author: req.session.user.username });
  res.redirect('/posts');
};

exports.showPost = (req, res) => {
  const post = findById(req.params.id);
  if (!post) return res.status(404).send('Post not found');
  const postComments = findByPostId(post.id);
  res.render('post', { post, comments: postComments , title: 'Post Not Found'  });
};