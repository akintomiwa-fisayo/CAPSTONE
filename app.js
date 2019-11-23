// Import Basic modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./dbconn');
// Import routes
const authRoutes = require('./routes/auth');
const gifsRoutes = require('./routes/gifs');
const feedRoutes = require('./routes/feed');
const articlesRoutes = require('./routes/articles');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');
// Initialize app
const app = express();

// Set neccessary headers (to prevent CORS errors)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});
const jwt = require('jsonwebtoken');


console.log('USER : ', jwt.sign({ userId: 1067, email: 'user@gmail.com' }, process.env.USERS_TOKEN_SECRET, {
  expiresIn: '99999999d',
}));

console.log('ADMIN : ', jwt.sign({ userId: 1065, email: 'admin@gmail.com' }, process.env.USERS_TOKEN_SECRET, {
  expiresIn: '99999999d',
}));

// Connect to database
db.connect().then(() => {
  console.log('Successfully connected to postgresSQL!');
}).catch(() => {
  console.log('Unable to connect to postgresSQL!');
});

// Parse request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      const error = new Error('Bad request');
      error.status = 400;
      next(error);
    }
    return next();
  });
});

// Route requests to specific URI
app.use('/auth', authRoutes);
app.use('/gifs', gifsRoutes);
app.use('/articles', articlesRoutes);
app.use('/feed', feedRoutes);
app.use('/reports', reportsRoutes);
app.use('/users', usersRoutes);

// Handle error
app.use((req, res, next) => {
  // If this middleware is executed then endpoint requested for wasn't expected
  const error = new Error('Resource not found');
  error.status = 404;
  next(error);
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
  res.status(error.status || 500).json({
    status: 'error',
    error: error.message,
  });
});

// Export app
module.exports = app;
