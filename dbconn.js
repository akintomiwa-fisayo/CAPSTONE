require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
const ssl = process.env.NODE_ENV === 'production';
const pool = new Pool({ connectionString, ssl });

module.exports = pool;
