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

    // Test to validate passport
    if (req.file) {
      test.image = req.file.mimetype !== 'image/gif' ? 'Invalid: file type must be GIF' : 'Valid';
    } else test.image = 'Undefined';

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
    // res.send('done and done');
    // Upload the gif image cloudinary
    cloud.uploads(req.file.path).then(({ secure_url }) => {
      fs.unlink(req.file.path, (error) => (error ? console.log('Unable to delete file after upload :', error) : ''));

      // Register in posts table
      db.query('INSERT INTO posts ("post_type", "post_author") VALUES ($1, $2) RETURNING "post_id", "created_on"',
        ['gif', req.loggedInUser.user_id]).then(({ rows: [{ post_id: postId, created_on: createdOn }] }) => {
        // Register in gifs table
        db.query('INSERT INTO gifs ("post_id", "image_url", "title") VALUES ($1, $2, $3)',
          [postId, secure_url, req.body.title]).then(() => {
          // console.log('GIF image successfully posted');
          res.status(201).json({
            status: 'success',
            data: {
              gifId: parseInt(postId, 10),
              message: 'GIF image successfully posted',
              createdOn,
              title: req.body.title,
              imageUrl: secure_url,
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
    }).catch((error) => {
      console.log('Cloudinary error ', error);
      fs.unlink(req.file.path, (err) => { console.log('Error at deleting failed upload passport', err); });
      res.status(500).json({
        status: 'error',
        error: 'Sorry, we couldn\'t complete your request please try again',
      });
    });
  } else {
    if (req.file) {
      fs.unlink(req.file.path, (error) => (error ? console.log('Unable to delete file after upload :', error) : ''));
    }
    res.status(400).json({
      status: 'error',
      error: report.error,
    });
  }
};
