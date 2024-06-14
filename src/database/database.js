// src/database/database.js
const mysql2 = require('mysql2/promise');
const { dbConfig } = require('../config');

const pool = mysql2.createPool({
  connectionLimit: 10,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
});

async function setupDatabase() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS premium_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        endDate TIMESTAMP NULL,
        UNIQUE KEY unique_user (userId)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guildId VARCHAR(255) NOT NULL,
        roleId VARCHAR(255) NOT NULL,
        permissionLevel VARCHAR(255) NOT NULL,
        UNIQUE KEY unique_role_permission (guildId, roleId)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        setting_name VARCHAR(255) NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        UNIQUE KEY unique_setting (guild_id, setting_name)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS custom_commands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        command VARCHAR(255) NOT NULL,
        response TEXT NOT NULL,
        UNIQUE KEY unique_custom_command (guild_id, command)
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function getRolePermissionLevel(guildId, roleId) {
  try {
    const [rows] = await pool.execute(
      'SELECT permissionLevel FROM role_permissions WHERE guildId = ? AND roleId = ?',
      [guildId, roleId]
    );
    return rows.length > 0 ? rows[0].permissionLevel : 'normal';
  } catch (error) {
    console.error('Error getting role permission level:', error);
    return 'normal';
  }
}

async function addOwnerRole(guildId, ownerId) {
  try {
    await pool.execute(
      'INSERT INTO role_permissions (guildId, roleId, permissionLevel) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permissionLevel = VALUES(permissionLevel)',
      [guildId, ownerId, 'owner']
    );
  } catch (error) {
    console.error('Error adding owner role:', error);
  }
}

async function hasPremiumSubscription(userId) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM premium_subscriptions WHERE userId = ? AND endDate > CURRENT_TIMESTAMP',
      [userId]
    );
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking premium subscription:', error);
    return false;
  }
}

async function addPremiumSubscription(userId, endDate) {
  try {
    await pool.execute(
      'INSERT INTO premium_subscriptions (userId, endDate) VALUES (?, ?) ON DUPLICATE KEY UPDATE endDate = VALUES(endDate)',
      [userId, endDate]
    );
  } catch (error) {
    console.error('Error adding premium subscription:', error);
  }
}

async function removePremiumSubscription(userId) {
  try {
    await pool.execute(
      'DELETE FROM premium_subscriptions WHERE userId = ?',
      [userId]
    );
  } catch (error) {
    console.error('Error removing premium subscription:', error);
  }
}

async function setStoryChannel(guildId, channelId) {
  try {
    await pool.execute(
      'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, 'story_channel', channelId]
    );
  } catch (error) {
    console.error('Error setting story channel:', error);
  }
}

async function getStoryChannel(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'story_channel']
    );
    return rows.length > 0 ? rows[0].setting_value : null;
  } catch (error) {
    console.error('Error getting story channel:', error);
    return null;
  }
}

async function removeStoryChannel(guildId) {
  try {
    await pool.execute(
      'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'story_channel']
    );
  } catch (error) {
    console.error('Error removing story channel:', error);
  }
}

async function getStoryChannels() {
  try {
    const [rows] = await pool.execute(
      'SELECT guild_id, setting_value FROM guild_settings WHERE setting_name = ?',
      ['story_channel']
    );
    return rows;
  } catch (error) {
    console.error('Error getting story channels:', error);
    return [];
  }
}

async function addCustomCommand(guildId, command, response) {
  try {
    await pool.execute(
      'INSERT INTO custom_commands (guild_id, command, response) VALUES (?, ?, ?)',
      [guildId, command, response]
    );
  } catch (error) {
    console.error('Error adding custom command:', error);
  }
}

async function removeCustomCommand(guildId, command) {
  try {
    await pool.execute(
      'DELETE FROM custom_commands WHERE guild_id = ? AND command = ?',
      [guildId, command]
    );
  } catch (error) {
    console.error('Error removing custom command:', error);
  }
}

async function executeCustomCommand(guildId, command) {
  try {
    const [rows] = await pool.execute(
      'SELECT response FROM custom_commands WHERE guild_id = ? AND command = ?',
      [guildId, command]
    );
    return rows.length > 0 ? rows[0].response : null;
  } catch (error) {
    console.error('Error executing custom command:', error);
    return null;
  }
}

async function getCustomCommands(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT command, response FROM custom_commands WHERE guild_id = ?',
      [guildId]
    );
    return rows;
  } catch (error) {
    console.error('Error getting custom commands:', error);
    return [];
  }
}

async function getCustomCommandLimit(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'custom_command_limit']
    );
    return rows.length > 0 ? parseInt(rows[0].setting_value) : 10;
  } catch (error) {
    console.error('Error getting custom command limit:', error);
    return 10;
  }
}

async function setCustomCommandLimit(guildId, limit) {
  try {
    await pool.execute(
      'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, 'custom_command_limit', limit]
    );
  } catch (error) {
    console.error('Error setting custom command limit:', error);
  }
}

async function createUserProfilesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        about_me TEXT,
        links JSON,
        birthday VARCHAR(255),
        location VARCHAR(255),
        interests JSON,
        story TEXT,
        UNIQUE KEY unique_user_profile (user_id, guild_id)
      )
    `);
    console.log('User profiles table created or already exists.');
  } catch (error) {
    console.error('Error creating user_profiles table:', error);
  }
}

module.exports = {
  pool,
  setupDatabase,
  hasPremiumSubscription,
  getRolePermissionLevel,
  addOwnerRole,
  addPremiumSubscription,
  removePremiumSubscription,
  setStoryChannel,
  getStoryChannel,
  removeStoryChannel,
  getStoryChannels,
  addCustomCommand,
  removeCustomCommand,
  executeCustomCommand,
  getCustomCommands,
  getCustomCommandLimit,
  setCustomCommandLimit,
  createUserProfilesTable,
};
