/* eslint-disable camelcase */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const db = require('../dbconn');
const cloud = require('../middleware/cloudinary');
// eslint-disable-next-line no-unused-vars
const lib = require('../middleware/lib');


exports.createUser = (req, res) => {
  const validate = () => {
    let isValid = true;
    const test = {};
    const data = {
      firstName: req.body.firstName ? req.body.firstName.toLowerCase() : false,
      lastName: req.body.lastName ? req.body.lastName.toLowerCase() : false,
      email: req.body.email ? req.body.email.toLowerCase() : false,
      password: req.body.password ? req.body.password : false,
      gender: req.body.gender ? req.body.gender.toLowerCase() : false,
      jobRole: req.body.jobRole ? req.body.jobRole.toLowerCase() : false,
      department: req.body.department ? req.body.department.toLowerCase() : false,
      address: req.body.address ? req.body.address.toLowerCase() : false,
    };
    const isJobRole = (jobRole) => {
      let department = false;
      Object.keys(db.$departments).forEach((dept) => {
        if (!department && db.$departments[dept].indexOf(jobRole) !== -1) {
          department = dept;
        }
      });
      return department;
    };

    // Test to validate first name
    if (data.firstName) {
      test.firstName = lib.isEmpty(data.firstName) ? 'Invalid: can\'t be empty' : 'Valid';
    } else test.firstName = 'Undefined';

    // Test to validate last name
    if (data.lastName) {
      test.lastName = lib.isEmpty(data.lastName) ? 'Invalid: can\'t be empty' : 'Valid';
    } else test.lastName = 'Undefined';

    // Test to validate email
    if (data.email) {
      if (lib.isEmail(data.email)) {
        test.email = db.$usersEmail.indexOf(data.email) !== -1 ? 'Invalid: already exist' : 'Valid';
      } else test.email = 'Invalid: has to be a Valid email';
    } else test.email = 'Undefined';

    // Test to validate password
    if (data.password) {
      test.password = (lib.isEmpty(data.password) || data.password.length < 8) ? 'Invalid: needs to be atleast 8 character long' : 'Valid';
    } else test.password = 'Undefined';

    // Test to validate gender
    if (data.gender) {
      test.gender = ['male', 'female'].indexOf(data.gender) === -1 ? 'Invalid: has to be "male" or "female"' : 'Valid';
    } else test.gender = 'Undefined';

    // Test to validate jobRole
    const department = isJobRole(data.jobRole);
    if (data.jobRole) {
      test.jobRole = !department ? 'Invalid: not a Valid job role' : 'Valid';
    } else test.jobRole = 'Undefined';

    // Test to validate department
    if (data.department) {
      test.department = data.department.toLowerCase() !== department ? 'Invalid: not a Valid department' : 'Valid';
    } else test.department = 'Undefined';

    // Test to validate address
    if (data.address) {
      test.address = lib.isEmpty(data.address) ? 'Invalid: can\'t be empty' : 'Valid';
    } else test.address = 'Undefined';

    // Test to validate passport
    if (req.file) {
      test.passport = ['image/jpg', 'image/jpeg'].indexOf(req.file.mimetype) === -1 ? 'Invalid: file type must be either JPEG or JPG' : 'Valid';
    } else test.passport = 'Undefined';

    const error = {};
    Object.keys(test).forEach((key) => {
      if (test[key] !== 'Valid') {
        error[key] = test[key];
        if (isValid) isValid = false;
      }
    });

    return isValid ? { status: true, data } : { status: false, error };
  };
  const report = validate();

  // Validate request before submitting
  if (report.status) {
    // Upload user passport to cloudinary
    cloud.uploads(req.file.path).then(({ secure_url }) => {
      fs.unlink(req.file.path, (error) => (error ? console.log('Unable to delete file after upload :', error) : ''));
      const { data } = report;

      // Hash user password
      bcrypt.hash(data.password, 10).then((hash) => {
        // Create account in database
        db.query('INSERT INTO users ("passport_url", "first_name", "last_name", "email", "password", "gender", "job_role", "department", "address", "token") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING "user_id"',
          [secure_url, data.firstName, data.lastName, data.email, hash, data.gender, data.jobRole, data.department, data.address, 'token']).then(({ rows: [{ user_id: userId }] }) => {
          /* since admin will be creating account for others, token shouldn't be generated now
          (but at login) and there's no point in admin seeing their token,
          but for the sake of following instructions JUST DO IT!
          */
          const token = jwt.sign({
            userId,
            email: data.email,
            password: hash,
          }, process.env.USERS_TOKEN_SECRET, {
            expiresIn: '24h',
          });

          db.query('UPDATE users SET "token"=$1 WHERE "user_id"=$2', [token, userId]).then(() => {
            res.status(201).json({
              status: 'success',
              data: {
                message: 'User account successfully created',
                token,
                userId: parseInt(userId, 10),
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
    if (req.file) fs.unlink(req.file.path, (error) => (error ? console.log('Unable to delete file after upload :', error) : ''));
    res.status(400).json({
      status: 'error',
      error: report.error,
    });
  }
};

exports.signIn = (req, res) => {
  if (req.body.username && req.body.password) {
    db.query('SELECT * FROM users WHERE "email"=$1', [req.body.username]).then(({ rowCount, rows }) => {
      if (rowCount > 0) {
        const user = rows[0];
        bcrypt.compare(req.body.password, user.password).then((valid) => {
          if (valid) {
            const token = jwt.sign({
              userId: user.user_id,
              email: req.body.username,
              password: user.password,
            }, process.env.USERS_TOKEN_SECRET, {
              expiresIn: '24h',
            });

            db.query('UPDATE users SET "token"=$1 WHERE "user_id"=$2', [token, user.user_id]).then(() => {
              res.status(200).json({
                status: 'success',
                data: {
                  token,
                  userId: parseInt(user.user_id, 10),
                  firstName: user.first_name,
                  lastName: user.last_name,
                  email: user.email,
                  gender: user.gender,
                  address: user.address,
                  jobRole: user.job_role,
                  department: user.department,
                  passportUrl: user.passport_url,
                  hiredOn: user.hired_on,
                },
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
              error: 'Incorrect email or password',
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
          error: 'Incorrect email or password',
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
      error: 'Bad request',
    });
  }
};

exports.changePasword = (req, res) => {
  const validate = () => {
    let isValid = true;
    const test = {};

    // Test to validate old password
    if (req.body.oldPassword) {
      req.body.oldPassword = req.body.oldPassword.toLowerCase();
      test.oldPassword = lib.isEmpty(req.body.oldPassword) ? 'Invalid' : 'Valid';
    } else test.oldPassword = 'Undefined';

    // Test to validate new password
    if (req.body.newPassword) {
      test.newPassword = (lib.isEmpty(req.body.newPassword) || req.body.newPassword.length < 8) ? 'Invalid: needs to be atleast 8 character long' : 'Valid';
    } else test.newPassword = 'Undefined';

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
    // res.send(req.loggedInUser);
    bcrypt.compare(req.body.oldPassword, req.loggedInUser.password).then((valid) => {
      if (valid) {
        // Hash user password
        bcrypt.hash(req.body.newPassword, 10).then((hash) => {
          // generate new token
          const token = jwt.sign({
            userId: req.loggedInUser.user_id,
            email: req.loggedInUser.email,
            password: hash,
          }, process.env.USERS_TOKEN_SECRET, {
            expiresIn: '24h',
          });

          db.query(`UPDATE users 
            SET "password"=$1, "token"=$2 
            WHERE user_id = $3`, [
            hash,
            token,
            req.loggedInUser.user_id,
          ]).then(() => {
            res.status(200).json({
              status: 'success',
              data: {
                message: 'Password changed successfully',
                token,
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
          error: 'Old password incorrect',
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
