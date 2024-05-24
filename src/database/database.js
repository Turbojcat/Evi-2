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
  pool.query(
    `CREATE TABLE IF NOT EXISTS premium_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP NULL,
      UNIQUE KEY unique_user (guild_id, user_id)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during premium_users table creation:', err);
        return;
      }
      console.log('Premium users table created or already exists');
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS example_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      data VARCHAR(255) NOT NULL
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during example_table creation:', err);
        return;
      }
      console.log('Example table created or already exists');
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS guild_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      setting_name VARCHAR(255) NOT NULL,
      setting_value VARCHAR(255) NOT NULL,
      UNIQUE KEY unique_setting (guild_id, setting_name)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during guild_settings table creation:', err);
        return;
      }
      console.log('Guild settings table created or already exists');
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS premium_role (
      guild_id VARCHAR(255) PRIMARY KEY,
      role_id VARCHAR(255) NOT NULL
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during premium_role table creation:', err);
        return;
      }
      console.log('Premium role table created or already exists');
    }
  );
};

module.exports = {
  pool,
  setupDatabase
};
