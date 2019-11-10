const jwt = require('jsonwebtoken');

const user = {
  id: 1067,
  firstName: 'name',
  lastName: 'name',
  email: 'user@gmail.com',
  password: '$2b$10$NJKkups9jG6D4ZV7s8y7tOtvtuR5jgtPA6xuJgGzx2Xf3rnrNOIky',
  password_text: 'password',
  gender: 'male',
  jobRole: 'j1003',
  department: 'd1002',
  address: 'address',
  passport: 'https://res.cloudinary.com/capstone-backend/image/upload/v1573054820/gkascktgwbavuemvjy4v.jpg',
  token: jwt.sign({
    userId: 1067,
    email: 'user@gmail.com',
  }, process.env.USERS_TOKEN_SECRET, {
    expiresIn: '24h',
  }),
};

// //////////////////////////////////////////////////////////////////////
exports.users = {
  admin: {
    ...user,
    id: 1065,
    email: 'admin@gmail.com',
    jobRole: 'j1001',
    department: 'd1002',
    token: jwt.sign({
      userId: 1065,
      email: 'admin@gmail.com',
    }, process.env.USERS_TOKEN_SECRET, {
      expiresIn: '24h',
    }),
  },
  user,
};
