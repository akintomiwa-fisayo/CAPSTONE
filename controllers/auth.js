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
    const error = {};
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
      error.firstName = lib.isEmpty(data.firstName) ? 'Invalid: can\'t be empty' : 'Valid';
    } else error.firstName = 'undefined';

    // Test to validate last name
    if (data.lastName) {
      error.lastName = lib.isEmpty(data.lastName) ? 'Invalid: can\'t be empty' : 'Valid';
    } else error.lastName = 'undefined';

    // Test to validate email
    if (data.email) {
      if (lib.isEmail(data.email)) {
        error.email = db.$usersEmail.indexOf(data.email) !== -1 ? 'Invalid: already exist' : 'Valid';
      } else error.email = 'Invalid: has to be a Valid email';
    } else error.email = 'undefined';

    // Test to validate password
    if (data.password) {
      error.password = (lib.isEmpty(data.password) || data.password.length < 8) ? 'Invalid: needs to be atleast 8 character long' : 'Valid';
    } else error.password = 'undefined';

    // Test to validate gender
    if (data.gender) {
      error.gender = ['male', 'female'].indexOf(data.gender) === -1 ? 'Invalid: has to be "male" or "female"' : 'Valid';
    } else error.gender = 'undefined';

    // Test to validate jobRole
    const department = isJobRole(data.jobRole);
    if (data.jobRole) {
      error.jobRole = !department ? 'Invalid: not a Valid job role' : 'Valid';
    } else error.jobRole = 'undefined';

    // Test to validate department
    if (data.department) {
      error.department = data.department.toLowerCase() !== department ? 'Invalid: not a Valid department' : 'Valid';
    } else error.department = 'undefined';

    // Test to validate address
    if (data.address) {
      error.address = lib.isEmpty(data.address) ? 'Invalid: can\'t be empty' : 'Valid';
    } else error.address = 'undefined';

    // Test to validate passport
    if (req.files && req.files[0] && req.files[0].fieldname.toLowerCase() === 'passport') {
      error.passport = ['image/jpg', 'image/jpeg'].indexOf(req.files[0].mimetype) === -1 ? 'Invalid: file type must be either JPEG or JPG' : 'Valid';
    } else error.passport = 'undefined';

    Object.keys(error).forEach((key) => {
      if (isValid && error[key] !== 'Valid') {
        isValid = false;
      }
    });

    return isValid ? { status: true, data } : { status: false, error };
  };
  const report = validate();

  // Validate request before submitting
  if (report.status) {
    cloud.uploads(req.files[0].path).then(({ secure_url }) => {
      fs.unlink(req.files[0].path, (error) => (error ? console.log('Unable to delete file after upload :', error) : ''));
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
          }, process.env.USERS_TOKEN_SECRET, {
            expiresIn: '24h',
          });

          db.query('UPDATE users SET "token"=$1 WHERE "user_id"=$2', [token, userId]).then(() => {
            console.log('User account successfully created');
            res.status(201).json({
              status: 'success',
              data: {
                message: 'User account successfully created',
                token,
                userId,
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
      fs.unlink(req.files[0].path, (err) => { console.log('Error at deleting failed upload passport', err); });
      res.status(500).json({
        status: 'error',
        error: 'Sorry, we couldn\'t complete your request please try again',
      });
    });
  } else {
    if (req.files) {
      fs.unlink(req.files[0].path, (error) => (error ? console.log('Unable to delete file after upload :', error) : ''));
    }
    res.status(400).json({
      status: 'error',
      error: report.error,
    });
  }
};

exports.signIn = (req, res) => {
  if (req.body.email && req.body.password) {
    db.query('SELECT token, user_id, password FROM users WHERE "email"=$1', [req.body.email]).then(({ rowCount, rows }) => {
      if (rowCount > 0) {
        const user = rows[0];
        bcrypt.compare(req.body.password, user.password).then((valid) => {
          if (valid) {
            const token = jwt.sign({
              userId: user.user_id,
              email: req.body.email,
            }, process.env.USERS_TOKEN_SECRET, {
              expiresIn: '24h',
            });

            db.query('UPDATE users SET "token"=$1 WHERE "user_id"=$2', [token, user.user_id]).then(() => {
              res.status(200).json({
                status: 'success',
                data: {
                  token,
                  userId: user.user_id,
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
