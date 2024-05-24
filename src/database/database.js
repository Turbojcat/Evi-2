// src/database/database.js
const mysql = require('mysql');
const { dbConfig } = require('../config');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
  connection.release();
});

const setupDatabase = () => {
  pool.query(`CREATE TABLE IF NOT EXISTS example_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL
  )`, (err, results) => {
    if (err) {
      console.error('Error during table creation:', err);
      return;
    }
    console.log('Table created or already exists');
  });
};

module.exports = {
  pool,
  setupDatabase
};
