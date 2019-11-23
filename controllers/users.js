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

      console.log('userid : ', user.id, 'logd user : ', req.loggedInUser.user_id);
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
