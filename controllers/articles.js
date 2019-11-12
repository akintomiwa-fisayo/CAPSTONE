/* eslint-disable camelcase */
const db = require('../dbconn');
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

exports.modify = (req, res) => {
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
    // Verify that article exists
    db.query('SELECT "post_id" FROM posts WHERE post_id = $1 AND post_author = $2', [req.params.id, req.loggedInUser.user_id]).then(({ rowCount }) => {
      // console.log('row cound it : ', rowCount);
      if (rowCount === 0) {
        res.status(404).json({
          status: 'error',
          error: 'Article not found!',
        });
      } else {
        // Update article
        db.query('UPDATE articles SET  "title" = $1, "article" = $2 WHERE post_id = $3', [req.body.title, req.body.article, req.params.id]).then(() => {
          res.status(201).json({
            status: 'success',
            data: {
              message: 'Article successfully updated',
              title: req.body.title,
              article: req.body.article,
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
