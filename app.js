const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts); // Add this line
app.set('layout', 'layout'); // Default layout

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'xss-secret',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.get('/', (req, res) => res.redirect('/posts'));

app.use('/', authRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

app.listen(3000, () => console.log('App running at http://localhost:3000'));