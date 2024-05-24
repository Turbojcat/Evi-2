// src/database/database.js
const mysql = require('mysql');
const { dbConfig } = require('../config');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
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
    `CREATE TABLE IF NOT EXISTS premium_subscriptions (
      userId VARCHAR(255) PRIMARY KEY,
      startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      endDate TIMESTAMP NULL
    )`,
    (err, results) => {
      if (err) {
        console.error('Error creating premium_subscriptions table:', err);
        return;
      }
      console.log('Premium subscriptions table created or already exists');
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS role_permissions (
      guildId VARCHAR(255),
      roleId VARCHAR(255),
      permissionLevel ENUM('normal', 'moderator', 'admin', 'owner'),
      PRIMARY KEY (guildId, roleId)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error creating role_permissions table:', err);
        return;
      }
      console.log('Role permissions table created or already exists');
    }
  );
};

const hasPremiumSubscription = async (userId) => {
  const query = 'SELECT * FROM premium_subscriptions WHERE userId = ? AND endDate > CURRENT_TIMESTAMP';
  const [results] = await pool.promise().query(query, [userId]);
  return results.length > 0;
};

const getRolePermissionLevel = async (guildId, roleId) => {
  const query = 'SELECT permissionLevel FROM role_permissions WHERE guildId = ? AND roleId = ?';
  const [results] = await pool.promise().query(query, [guildId, roleId]);
  return results.length > 0 ? results[0].permissionLevel : 'normal';
};

const addRolePermission = async (guildId, roleId, permissionLevel) => {
  const query = 'INSERT INTO role_permissions (guildId, roleId, permissionLevel) VALUES (?, ?, ?)';
  await pool.promise().query(query, [guildId, roleId, permissionLevel]);
};

const removeRolePermission = async (guildId, roleId) => {
  const query = 'DELETE FROM role_permissions WHERE guildId = ? AND roleId = ?';
  await pool.promise().query(query, [guildId, roleId]);
};

const addPremiumSubscription = async (userId, endDate) => {
  const query = 'INSERT INTO premium_subscriptions (userId, endDate) VALUES (?, ?)';
  await pool.promise().query(query, [userId, endDate]);
};

const removePremiumSubscription = async (userId) => {
  const query = 'DELETE FROM premium_subscriptions WHERE userId = ?';
  await pool.promise().query(query, [userId]);
};

module.exports = {
  pool,
  setupDatabase,
  hasPremiumSubscription,
  getRolePermissionLevel,
  addRolePermission,
  removeRolePermission,
  addPremiumSubscription,
  removePremiumSubscription,
};
