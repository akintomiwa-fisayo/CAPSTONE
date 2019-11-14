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

  // Validate request before processing
  if (report.status) {
    // Verify that Article exists
    db.query(`
      SELECT post_author
      FROM posts 
      WHERE post_id = $1
      AND post_type = 'article'
    `, [req.params.id]).then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        // Article does not exist
        res.status(404).json({
          status: 'error',
          error: 'Article not found',
        });
      } else if (rows[0].post_author !== parseInt(req.loggedInUser.user_id, 10)) {
        // Article is valid but does not belong to Current user
        res.status(401).json({
          status: 'error',
          error: 'Unauthorized to modify this article',
        });
      } else {
        // Article is valid and belongs to current user
        // Update article
        db.query(`UPDATE articles
          SET "title" = $1, "article" = $2 
          FROM posts 
          WHERE posts.post_id = articles.post_id 
          AND posts.post_id = $3 
          AND posts.post_author = $4
          RETURNING articles.title, articles.article`, [
          req.body.title,
          req.body.article,
          req.params.id,
          req.loggedInUser.user_id,
        ]).then(({ rows: [article] }) => {
          res.status(201).json({
            status: 'success',
            data: {
              message: 'Article successfully updated',
              title: article.title,
              article: article.article,
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
      SELECT articles.title, articles.article
      FROM posts 
      INNER JOIN articles 
      ON posts.post_id = articles.post_id
      WHERE posts.post_id = $1
      `, [req.params.id])
      .then(({ rowCount, rows }) => {
        if (rowCount === 0) {
          res.status(404).json({
            status: 'error',
            error: 'Article not found',
          });
        } else {
          // Insert comment
          const article = rows[0];
          db.query(`INSERT INTO post_comments (post_id, author_id, comment)
            VALUES ($1, $2, $3) RETURNING created_on, comment_id`, [
            req.params.id,
            req.loggedInUser.user_id,
            req.body.comment,
          ]).then(({ rows: [comm] }) => {
            res.status(201).json({
              status: 'success',
              data: {
                message: 'Comment successfully created',
                createdOn: comm.created_on,
                articleTitle: article.title,
                article: article.article,
                comment: req.body.comment,
                commentId: comm.comment_id,
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
  // Delete article
  db.query(`DELETE 
    FROM posts 
    WHERE post_id = $1
    AND post_author = $2
    AND post_type = $3`, [
    req.params.id,
    req.loggedInUser.user_id,
    'article',
  ]).then(({ rowCount }) => {
    if (rowCount === 0) {
      res.status(404).json({
        status: 'error',
        error: 'Article not found',
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          message: 'Article successfully deleted',
        },
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
