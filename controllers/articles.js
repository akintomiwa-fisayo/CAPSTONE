/* eslint-disable camelcase */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const db = require('../dbconn');
const cloud = require('../middleware/cloudinary');
const lib = require('../middleware/lib');


exports.create = (req, res) => {
  const validate = () => {
    let isValid = true;
    const test = {};

    // Test to validate title
    if (req.body.title) {
      req.body.title = req.body.title.toLowerCase();
      test.title = lib.isEmpty(req.body.title) ? 'Invalid: can\'t be empty' : 'Valid';
    } else test.title = 'Undefined';

    // Test to validate articles
    if (req.body.article) {
      req.body.article = req.body.article.toLowerCase();
      test.article = lib.isEmpty(req.body.article) ? 'Invalid: can\'t be empty' : 'Valid';
    } else test.article = 'Undefined';

    const error = {};
    Object.keys(test).forEach((key) => {
      if (test[key] !== 'Valid') {
        error[key] = test[key];
        if (isValid) isValid = false;
      }
    });

    return isValid ? { status: true } : { status: false, error };
  };
  const report = validate();

  // Validate request before submitting
  if (report.status) {
    // Register in posts table
    db.query('INSERT INTO posts ("post_type", "post_author") VALUES ($1, $2) RETURNING "post_id", "created_on"',
      ['article', req.loggedInUser.user_id]).then(({ rows: [{ post_id: postId, created_on: createdOn }] }) => {
      // Register in article table
      db.query('INSERT INTO articles ("post_id", "title", "article") VALUES ($1, $2, $3)',
        [postId, req.body.title, req.body.article]).then(() => {
        // console.log('article image successfully posted');
        res.status(201).json({
          status: 'success',
          data: {
            message: 'Article successfully posted',
            articleId: parseInt(postId, 10),
            createdOn,
            title: req.body.title,
          },
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 'error',
          error: 'Sorry, we couldn\'t complete your request please try again',
        });
      });
    }).catch((error) => {
      console.log(error);
      res.status(500).json({
        status: 'error',
        error: 'Sorry, we couldn\'t complete your request please try again',
      });
    });
  } else {
    res.status(400).json({
      status: 'error',
      error: report.error,
    });
  }
};
