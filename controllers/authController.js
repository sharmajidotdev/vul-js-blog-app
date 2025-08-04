const User = require('../models/user');
const db = require('../config/database');

exports.showRegister = (req, res) => res.render('register', { error: null , title: 'Register' });

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.render('register', { error: 'Username already exists', title: 'Register' });
    }
    await User.addUser({ username, password });
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Registration failed', title: 'Register' });
  }
};

exports.showLogin = (req, res) => res.render('login', { error: null, title: 'Login' });

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // VULNERABLE CODE (current implementation - demonstrates SQL injection)
    // This is intentionally vulnerable to SQL injection!
    // DO NOT USE THIS IN PRODUCTION!
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    db.query(query, (err, results) => {
      if (err || results.length === 0) {
        return res.render('login', { error: 'Invalid credentials', title: 'Login' });
      }
      req.session.user = results[0];
      res.redirect('/posts');
    });

    /* SECURE CODE - Uncomment this block and comment out the above block to prevent SQL injection
    // Using parameterized queries to prevent SQL injection*/
    // const secureQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
    // db.query(secureQuery, [username, password], (err, results) => {
    //   if (err || results.length === 0) {
    //     return res.render('login', { error: 'Invalid credentials', title: 'Login' });
    //   }
    //   req.session.user = results[0];
    //   res.redirect('/posts');
    // });
    
  } catch (err) {
    res.render('login', { error: 'Login failed', title: 'Login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

exports.profile = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user , title: 'Profile' });
};