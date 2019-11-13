/* eslint-disable camelcase */
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

exports.modify = (req, res) => {
  const validate = () => {
    let test = 'Undefined';

    // Test to validate title
    if (req.body.title) {
      req.body.title = req.body.title.toLowerCase();
      test = lib.isEmpty(req.body.title) ? 'Invalid: can\'t be empty' : 'Valid';
    }
    return test === 'Valid' ? { status: true } : { status: false, error: { title: test } };
  };
  const report = validate();

  // Validate request before processing
  if (report.status) {
    // Verify that Gif exists
    db.query(`
      SELECT post_author
      FROM posts 
      WHERE post_id = $1
      AND post_type = 'gif'
    `, [req.params.id]).then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        // Gif does not exist
        res.status(404).json({
          status: 'error',
          error: 'Gif not found',
        });
      } else if (rows[0].post_author !== parseInt(req.loggedInUser.user_id, 10)) {
        // Gif is valid but does not belong to Current user
        console.log('post author is : ', rows[0].post_author, 'user id : ', req.loggedInUser.user_id);
        res.status(401).json({
          status: 'error',
          error: 'Unauthorized to modify this gif',
        });
      } else {
        // Gif is valid and belongs to current user
        // Update gif
        db.query(`UPDATE gifs
          SET "title" = $1 
          FROM posts 
          WHERE posts.post_id = gifs.post_id 
          AND posts.post_id = $2 
          AND posts.post_author = $3 RETURNING gifs.image_url`, [
          req.body.title,
          req.params.id,
          req.loggedInUser.user_id,
        ]).then(({ rows: gfRows }) => {
          res.status(201).json({
            status: 'success',
            data: {
              message: 'Gif successfully updated',
              title: req.body.title,
              imageUrl: gfRows[0].image_url,
            },
          });
        }).catch((error) => {
          console.log(error);
          res.status(500).json({
            status: 'error',
            error: 'Sorry, we couldn\'t complete your request please try again',
          });
        });
      }
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

exports.comment = (req, res) => {
  const validate = () => {
    let test = 'Undefined';

    // Test to validate comment
    if (req.body.comment) {
      req.body.comment = req.body.comment.toLowerCase();
      test = lib.isEmpty(req.body.comment) ? 'Invalid: can\'t be empty' : 'Valid';
    }
    return test === 'Valid' ? { status: true } : { status: false, error: { comment: test } };
  };
  const report = validate();

  // Validate request before processing
  if (report.status) {
    // Validate that post exist
    db.query(`
      SELECT gifs.title
      FROM posts 
      INNER JOIN gifs 
      ON posts.post_id = gifs.post_id
      WHERE posts.post_id = $1
      `, [req.params.id])
      .then(({ rowCount, rows }) => {
        if (rowCount === 0) {
          res.status(404).json({
            status: 'error',
            error: 'Gif not found',
          });
        } else {
          const gifTitle = rows[0].title;
          // res.send(`comment recorded ${gifTitle}`);
          // Insert comment
          db.query(`INSERT INTO post_comments (post_id, author_id, comment)
            VALUES ($1, $2, $3) RETURNING created_on`, [
            req.params.id,
            req.loggedInUser.user_id,
            req.body.comment,
          ]).then(({ rows: comm_rows }) => {
            res.status(201).json({
              status: 'success',
              data: {
                message: 'Comment successfully created',
                createdOn: comm_rows[0].created_on,
                gifTitle,
                comment: req.body.comment,
              },
            });
          }).catch((error) => {
            console.log(error);
            res.status(500).json({
              status: 'error',
              error: 'Sorry, we couldn\'t complete your request please try again',
            });
          });
        }
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

exports.delete = (req, res) => {
  // Verify that gif exists
  db.query(`
    SELECT post_author
    FROM posts 
    WHERE post_id = $1
    AND post_type = 'gif'
  `, [req.params.id]).then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      // Gif does not exist
      res.status(404).json({
        status: 'error',
        error: 'Gif not found',
      });
    } else if (rows[0].post_author !== parseInt(req.loggedInUser.user_id, 10)) {
      // Gif is valid but does not belong to Current user
      res.status(401).json({
        status: 'error',
        error: 'Unauthorized to delete this gif',
      });
    } else {
      // Gif is valid and belongs to current user
      // Delete gif and gifs table and post_comment table will cascade
      db.query(`DELETE 
        FROM posts 
        WHERE post_id = $1
        AND post_author = $2
        AND post_type = $3`, [
        req.params.id,
        req.loggedInUser.user_id,
        'gif',
      ]).then(() => {
        res.status(200).json({
          status: 'success',
          data: {
            message: 'Gif successfully deleted',
          },
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 'error',
          error: 'Sorry, we couldn\'t complete your request please try again',
        });
      });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: 'Sorry, we couldn\'t complete your request please try again',
    });
  });
};
