// src/database/autoroledb.js
const { pool } = require('./database');

async function createAutoRoleTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS auto_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        role_id VARCHAR(255) NOT NULL,
        duration BIGINT,
        UNIQUE KEY unique_auto_role (guild_id, role_id)
      )
    `);
  } catch (error) {
    console.error('Error creating auto_roles table:', error);
  }
}

async function addAutoRole(guildId, roleId, duration) {
  try {
    await pool.execute(
      'INSERT INTO auto_roles (guild_id, role_id, duration) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE duration = VALUES(duration)',
      [guildId, roleId, duration]
    );
  } catch (error) {
    console.error('Error adding autorole:', error);
    throw error;
  }
}

async function removeAutoRole(guildId, roleId) {
  try {
    await pool.execute(
      'DELETE FROM auto_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, roleId]
    );
  } catch (error) {
    console.error('Error removing autorole:', error);
    throw error;
  }
}

async function getAutoRoles(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT role_id, duration FROM auto_roles WHERE guild_id = ?',
      [guildId]
    );
    return rows;
  } catch (error) {
    console.error('Error getting autoroles:', error);
    throw error;
  }
}

module.exports = {
  createAutoRoleTable,
  addAutoRole,
  removeAutoRole,
  getAutoRoles,
};
