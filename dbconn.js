const { Pool } = require('pg');

// console.log(process.env);

const pool = new Pool({
  host: 'localhost',
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASS,
  database: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME,
});

module.exports = pool;
