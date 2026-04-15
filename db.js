const mysql = require('mysql2/promise');
require('dotenv').config(); // This loads your hidden passwords

// Fallback credentials for Railway MySQL
const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql.railway.internal',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SegpBEzPgHVqYmAgWbSrbAZxrHiGOKdF',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = mysql.createPool(DB_CONFIG);

module.exports = pool;