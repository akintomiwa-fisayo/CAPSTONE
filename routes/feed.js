const express = require('express');
const db = require('../dbconn');

const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate.employee, (req, res) => {
  // Get all posts
  const offset = req.query.offset && !isNaN(req.query.offset) ? req.query.offset : 0;
  const limit = req.query.limit && !isNaN(req.query.limit) ? req.query.limit : 'ALL';
  db.query(`
    SELECT *
    FROM posts 
    ORDER BY created_on DESC
    OFFSET ${offset}
    LIMIT ${limit}
  `).then(({ rowCount, rows }) => {
    if (rowCount === 0) {
      res.status(404).json({
        status: 'error',
        error: 'No post found',
      });
    } else {
      const posts = [];
      let counter = -1;
      const parsePosts = () => new Promise((resolve) => {
        counter++;
        const post = rows[counter];
        const dest = post.post_type === 'article' ? 'articles' : 'gifs';
        db.query(`
          SELECT *
          FROM ${dest}
          WHERE post_id = $1 
        `, [
          post.post_id,
        ]).then(({ rows: [postInfo] }) => {
          const parsedPost = {
            id: parseInt(post.post_id, 10),
            createdOn: post.created_on,
            authorId: post.post_author,
            title: postInfo.title,
          };
          if (post.post_type === 'article') {
            parsedPost.article = postInfo.article;
          } else parsedPost.url = postInfo.image_url;
          parsedPost.type = post.post_type;

          posts.push(parsedPost);
          if (counter < rowCount - 1) {
            parsePosts().then(() => resolve());
          } else resolve();
        }).catch((error) => {
          console.log(error);
          res.status(500).json({
            status: 'error',
            error: 'Sorry, we couldn\'t complete your request please try again',
          });
        });
      });

      // Parse extended info posts into post objects
      parsePosts().then(() => {
        res.status(200).json({
          status: 'success',
          data: posts,
        });
      });
    }
  }).catch((error) => {
    console.log(error);
    res.send('we going to send the feed');
  });
});

module.exports = router;
