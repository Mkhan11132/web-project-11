const mysql = require('mysql2/promise');
require('dotenv').config(); // This loads your hidden passwords

// Fallback credentials for Clever-Cloud MySQL
const DB_CONFIG = {
  host: process.env.DB_HOST || 'bldm637x6gd2fsalwo71-mysql.services.clever-cloud.com',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'ukqlqkghpqbt7mrh',
  password: process.env.DB_PASSWORD || 'Hl321SPpmbZWxzpVftlm',
  database: process.env.DB_NAME || 'bldm637x6gd2fsalwo71',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = mysql.createPool(DB_CONFIG);

module.exports = pool;