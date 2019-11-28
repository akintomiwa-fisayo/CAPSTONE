const jwt = require('jsonwebtoken');
const db = require('../dbconn');

exports.parseUser = (req) => new Promise((resolve, reject) => {
  /* must have first called get-db-userTokenSecret in router list of middlewares */

  try {
    if (!req.headers.authorization) throw new Error('Bearer token undefined');
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.USERS_TOKEN_SECRET);
    const { userId, email, password } = decodedToken;
    // check if userId and email are attached to an account
    db.query('SELECT * FROM users WHERE "user_id"=$1 AND "email"=$2 AND "password"=$3', [userId, email, password])
      .then(({ rowCount, rows }) => resolve(rowCount > 0 ? rows[0] : false))
      .catch((error) => reject(error));
  } catch (error) {
    reject(['TokenExpiredError', 'JsonWebTokenError'].indexOf(error.name) === -1 ? error : false);
  }
});


exports.employee = (req, res, next) => {
  exports.parseUser(req).then((user) => {
    if (user) {
      req.loggedInUser = user;
      req.loggedInUser.user_id = parseInt(user.user_id, 10);
      next();
    } else {
      res.status(401).json({
        status: 'error',
        error: 'Unauthorized',
      });
    }
  }).catch((error) => {
    if (error) console.log(error);
    res.status(401).json({
      status: 'error',
      error: 'Unauthorized',
    });
  });
};

exports.admin = (req, res, next) => {
  exports.parseUser(req).then((user) => {
    if (user) {
      db.query('SELECT job_title FROM job_roles WHERE job_id = $1', [user.job_role]).then(({ rowCount, rows }) => {
        if (rowCount > 0 && rows[0].job_title === 'admin') {
          req.loggedInUser = user;
          req.loggedInUser.user_id = parseInt(user.user_id, 10);

          next();
        } else {
          res.status(401).json({
            status: 'error',
            error: 'Unauthorized',
          });
        }
      }).catch((error) => {
        console.log(error);
        res.status(401).json({
          status: 'error',
          error: 'Unauthorized',
        });
      });
    } else throw new Error('User was not found');
  }).catch((error) => {
    if (error) console.log(error);
    res.status(401).json({
      status: 'error',
      error: 'Unauthorized',
    });
  });
};
