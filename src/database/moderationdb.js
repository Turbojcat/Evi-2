// src/database/moderationdb.js
const { pool } = require('./database');

const createModerationTables = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS mutes (
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        expiration_time BIGINT,
        PRIMARY KEY (guild_id, user_id)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        moderator_id VARCHAR(255) NOT NULL,
        reason TEXT,
        timestamp BIGINT NOT NULL
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS moderation_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        moderator_id VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        target_id VARCHAR(255) NOT NULL,
        reason TEXT,
        timestamp BIGINT NOT NULL
      )
    `);

  } catch (error) {
    console.error('Error creating moderation tables:', error);
  }
};

const addMute = async (guildId, userId, expirationTime) => {
  try {
    await pool.execute(
      'INSERT INTO mutes (guild_id, user_id, expiration_time) VALUES (?, ?, ?)',
      [guildId, userId, expirationTime]
    );
  } catch (error) {
    console.error('Error adding mute:', error);
  }
};

const removeMute = async (guildId, userId) => {
  try {
    await pool.execute(
      'DELETE FROM mutes WHERE guild_id = ? AND user_id = ?',
      [guildId, userId]
    );
  } catch (error) {
    console.error('Error removing mute:', error);
  }
};

const getMute = async (guildId, userId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM mutes WHERE guild_id = ? AND user_id = ?',
      [guildId, userId]
    );
    return rows[0];
  } catch (error) {
    console.error('Error getting mute:', error);
    return null;
  }
};

const addWarning = async (guildId, userId, moderatorId, reason) => {
  try {
    await pool.execute(
      'INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
      [guildId, userId, moderatorId, reason, Date.now()]
    );
  } catch (error) {
    console.error('Error adding warning:', error);
  }
};

const getWarnings = async (guildId, userId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?',
      [guildId, userId]
    );
    return rows;
  } catch (error) {
    console.error('Error getting warnings:', error);
    return [];
  }
};

const clearWarnings = async (guildId, userId) => {
  try {
    await pool.execute(
      'DELETE FROM warnings WHERE guild_id = ? AND user_id = ?',
      [guildId, userId]
    );
  } catch (error) {
    console.error('Error clearing warnings:', error);
  }
};

const addModerationLog = async (guildId, moderatorId, action, targetId, reason) => {
  try {
    // Add logging to identify undefined parameters
    if (guildId === undefined || moderatorId === undefined || action === undefined || targetId === undefined || reason === undefined) {
      throw new Error('One or more parameters are undefined');
    }

    await pool.execute(
      'INSERT INTO moderation_logs (guild_id, moderator_id, action, target_id, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [guildId, moderatorId, action, targetId, reason, Date.now()]
    );
  } catch (error) {
    console.error('Error adding moderation log:', error);
  }
};

const getModerationLogs = async (guildId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM moderation_logs WHERE guild_id = ? ORDER BY timestamp DESC',
      [guildId]
    );
    return rows;
  } catch (error) {
    console.error('Error getting moderation logs:', error);
    return [];
  }
};

module.exports = {
  createModerationTables,
  addMute,
  removeMute,
  getMute,
  addWarning,
  getWarnings,
  clearWarnings,
  addModerationLog,
  getModerationLogs,
};
