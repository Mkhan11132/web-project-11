const mysql = require('mysql2/promise');
require('dotenv').config(); // This loads your hidden passwords

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000
});

module.exports = pool;