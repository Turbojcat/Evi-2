// src/database/autoroledb.js
const { pool } = require('./database');

const createAutoRoleTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS auto_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      role_id VARCHAR(255) NOT NULL,
      duration BIGINT,
      UNIQUE KEY unique_auto_role (guild_id, role_id)
    )
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating auto_roles table:', error);
    } else {
    }
  });
};

const addAutoRole = (guildId, roleId, duration) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO auto_roles (guild_id, role_id, duration) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE duration = VALUES(duration)',
      [guildId, roleId, duration],
      (error) => {
        if (error) {
          console.error('Error adding autorole:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeAutoRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM auto_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, roleId],
      (error) => {
        if (error) {
          console.error('Error removing autorole:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getAutoRoles = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT role_id, duration FROM auto_roles WHERE guild_id = ?',
      [guildId],
      (error, results) => {
        if (error) {
          console.error('Error getting autoroles:', error);
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

module.exports = {
  createAutoRoleTable,
  addAutoRole,
  removeAutoRole,
  getAutoRoles,
};
