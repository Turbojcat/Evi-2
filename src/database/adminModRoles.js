// src/database/adminModRoles.js
const { pool } = require('./database');

const createAdminModRolesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS admin_mod_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      role_id VARCHAR(255) NOT NULL,
      permission_level VARCHAR(255) NOT NULL,
      UNIQUE KEY unique_role_permission (guild_id, role_id)
    )
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating admin_mod_roles table:', error);
    } else {
    }
  });
};

const setAdminRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO admin_mod_roles (guild_id, role_id, permission_level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission_level = VALUES(permission_level)',
      [guildId, roleId, 'admin'],
      (error) => {
        if (error) {
          console.error('Error setting admin role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getAdminRoles = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT role_id FROM admin_mod_roles WHERE guild_id = ? AND permission_level = ?',
      [guildId, 'admin'],
      (error, results) => {
        if (error) {
          console.error('Error getting admin roles:', error);
          reject(error);
        } else {
          const adminRoles = results.map((row) => row.role_id);
          resolve(adminRoles);
        }
      }
    );
  });
};

const removeAdminRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM admin_mod_roles WHERE guild_id = ? AND role_id = ? AND permission_level = ?',
      [guildId, roleId, 'admin'],
      (error) => {
        if (error) {
          console.error('Error removing admin role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const setModeratorRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO admin_mod_roles (guild_id, role_id, permission_level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission_level = VALUES(permission_level)',
      [guildId, roleId, 'moderator'],
      (error) => {
        if (error) {
          console.error('Error setting moderator role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getModeratorRoles = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT role_id FROM admin_mod_roles WHERE guild_id = ? AND permission_level = ?',
      [guildId, 'moderator'],
      (error, results) => {
        if (error) {
          console.error('Error getting moderator roles:', error);
          reject(error);
        } else {
          const moderatorRoles = results.map((row) => row.role_id);
          resolve(moderatorRoles);
        }
      }
    );
  });
};

const removeModeratorRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM admin_mod_roles WHERE guild_id = ? AND role_id = ? AND permission_level = ?',
      [guildId, roleId, 'moderator'],
      (error) => {
        if (error) {
          console.error('Error removing moderator role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

module.exports = {
  createAdminModRolesTable,
  setAdminRole,
  getAdminRoles,
  removeAdminRole,
  setModeratorRole,
  getModeratorRoles,
  removeModeratorRole,
};
