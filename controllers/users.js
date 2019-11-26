/* eslint-disable camelcase */
const db = require('../dbconn');

exports.getOne = (req, res) => {
  // Validate that post exist
  db.query(` SELECT *
    FROM users 
    WHERE user_id = $1
    `, [req.params.id]).then(({ rowCount, rows }) => {
    if (rowCount === 0) {
      res.status(404).json({
        status: 'error',
        error: 'User not found',
      });
    } else {
      let columns = false;
      let res_user = {};
      const user = {
        id: parseInt(rows[0].user_id, 10),
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
        email: rows[0].email,
        gender: rows[0].gender,
        jobRole: rows[0].job_role,
        department: rows[0].department,
        passportUrl: rows[0].passport_url,
        hiredOn: rows[0].hired_on,
      };

      if (user.id === req.loggedInUser.user_id) {
        user.address = rows[0].address;
      }

      if (req.query.columns) {
        columns = req.query.columns.split(',');
        Object.keys(user).forEach((key) => {
          if (columns.indexOf(key) !== -1) {
            res_user[key] = user[key];
          }
        });
      } else res_user = user;

      res.status(200).json({
        status: 'success',
        data: res_user,
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

exports.getArticles = (req, res) => {
  if (req.loggedInUser.user_id === parseInt(req.params.id, 10)) {
    db.query(`
    SELECT *
    FROM posts 
    INNER JOIN articles 
    ON posts.post_id = articles.post_id
    WHERE posts.post_author = $1
    ORDER BY posts.created_on DESC
    `,
    [
      req.params.id,
    ]).then(({ rowCount, rows }) => {
      const articles = [];
      let counter = -1;
      const parseArticles = () => new Promise((resolve) => {
        // Get comments
        counter++;
        if (counter === rowCount) {
          resolve(articles);
        } else {
          const article = rows[counter];
          db.query(`
            SELECT comm.comment_id, comm.author_id, comm.comment, comm.created_on
            FROM posts 
            INNER JOIN post_comments comm
            ON posts.post_id = comm.post_id
            WHERE posts.post_id = $1
            ORDER BY comm.created_on ASC
          `, [article.post_id]).then(({ rows: comm }) => {
            const comments = [];
            for (let i = 0; i < comm.length; i++) {
              comments.push({
                commentId: comm[i].comment_id,
                comment: comm[i].comment,
                authorId: comm[i].author_id,
                createdOn: comm[i].created_on,
              });
            }
            articles.push({
              id: article.post_id,
              createdOn: article.created_on,
              title: article.title,
              article: article.article,
              comments,
              authorId: article.post_author,
            });
            parseArticles().then(resolve);
          }).catch((error) => {
            console.log(error);
            res.status(500).json({
              status: 'error',
              error: 'Sorry, we couldn\'t complete your request please try again',
            });
          });
        }
      });

      parseArticles().then(() => {
        res.status(200).json({
          status: 'success',
          data: articles,
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
    res.status(401).json({
      status: 'error',
      error: 'Unauthorized to access this resource',
    });
  }
};

exports.getGifs = (req, res) => {
  if (req.loggedInUser.user_id === parseInt(req.params.id, 10)) {
    db.query(`
    SELECT *
    FROM posts 
    INNER JOIN gifs 
    ON posts.post_id = gifs.post_id
    WHERE posts.post_author = $1
    ORDER BY posts.created_on DESC
    `,
    [
      req.params.id,
    ]).then(({ rowCount, rows }) => {
      const gifs = [];
      let counter = -1;
      const parseGifs = () => new Promise((resolve) => {
        // Get comments
        counter++;
        if (counter === rowCount) {
          resolve(gifs);
        } else {
          const gif = rows[counter];
          db.query(`
            SELECT comm.comment_id, comm.author_id, comm.comment, comm.created_on
            FROM posts 
            INNER JOIN post_comments comm
            ON posts.post_id = comm.post_id
            WHERE posts.post_id = $1
            ORDER BY comm.created_on ASC
          `, [gif.post_id]).then(({ rows: comm }) => {
            const comments = [];
            for (let i = 0; i < comm.length; i++) {
              comments.push({
                commentId: comm[i].comment_id,
                comment: comm[i].comment,
                authorId: comm[i].author_id,
                createdOn: comm[i].created_on,
              });
            }
            gifs.push({
              id: gif.post_id,
              createdOn: gif.created_on,
              title: gif.title,
              url: gif.image_url,
              comments,
              authorId: gif.post_author,
            });
            parseGifs().then(resolve);
          }).catch((error) => {
            console.log(error);
            res.status(500).json({
              status: 'error',
              error: 'Sorry, we couldn\'t complete your request please try again',
            });
          });
        }
      });

      parseGifs().then(() => {
        res.status(200).json({
          status: 'success',
          data: gifs,
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
    res.status(401).json({
      status: 'error',
      error: 'Unauthorized to access this resource',
    });
  }
};
