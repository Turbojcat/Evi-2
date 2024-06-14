// src/database/adminModRoles.js
const { pool } = require('./database');

async function createAdminModRolesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_mod_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        role_id VARCHAR(255) NOT NULL,
        permission_level VARCHAR(255) NOT NULL,
        UNIQUE KEY unique_role_permission (guild_id, role_id)
      )
    `);
    console.log('Admin mod roles table created or already exists.');
  } catch (error) {
    console.error('Error creating admin_mod_roles table:', error);
  }
}

async function setAdminRole(guildId, roleId) {
  try {
    await pool.execute(
      'INSERT INTO admin_mod_roles (guild_id, role_id, permission_level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission_level = VALUES(permission_level)',
      [guildId, roleId, 'admin']
    );
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw error;
  }
}

async function getAdminRoles(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT role_id FROM admin_mod_roles WHERE guild_id = ? AND permission_level = ?',
      [guildId, 'admin']
    );
    return rows.map((row) => row.role_id);
  } catch (error) {
    console.error('Error getting admin roles:', error);
    throw error;
  }
}

async function removeAdminRole(guildId, roleId) {
  try {
    await pool.execute(
      'DELETE FROM admin_mod_roles WHERE guild_id = ? AND role_id = ? AND permission_level = ?',
      [guildId, roleId, 'admin']
    );
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw error;
  }
}

async function setModeratorRole(guildId, roleId) {
  try {
    await pool.execute(
      'INSERT INTO admin_mod_roles (guild_id, role_id, permission_level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission_level = VALUES(permission_level)',
      [guildId, roleId, 'moderator']
    );
  } catch (error) {
    console.error('Error setting moderator role:', error);
    throw error;
  }
}

async function getModeratorRoles(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT role_id FROM admin_mod_roles WHERE guild_id = ? AND permission_level = ?',
      [guildId, 'moderator']
    );
    return rows.map((row) => row.role_id);
  } catch (error) {
    console.error('Error getting moderator roles:', error);
    throw error;
  }
}

async function removeModeratorRole(guildId, roleId) {
  try {
    await pool.execute(
      'DELETE FROM admin_mod_roles WHERE guild_id = ? AND role_id = ? AND permission_level = ?',
      [guildId, roleId, 'moderator']
    );
  } catch (error) {
    console.error('Error removing moderator role:', error);
    throw error;
  }
}

module.exports = {
  createAdminModRolesTable,
  setAdminRole,
  getAdminRoles,
  removeAdminRole,
  setModeratorRole,
  getModeratorRoles,
  removeModeratorRole,
};
