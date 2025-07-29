const { users, findByUsername, addUser } = require('../models/user');

exports.showRegister = (req, res) => res.render('register', { error: null , title: 'Register' });

exports.register = (req, res) => {
  const { username, password } = req.body;
  if (findByUsername(username)) {
    return res.render('register', { error: 'Username already exists', title: 'Register' });
  }
  addUser({ username, password });
  res.redirect('/login');
};

exports.showLogin = (req, res) => res.render('login', { error: null, title: 'Login' });

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.render('login', { error: 'Invalid credentials', title: 'Login' });
  req.session.user = user;
  res.redirect('/posts');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

exports.profile = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user , title: 'Profile' });
};