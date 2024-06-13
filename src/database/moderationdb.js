// src/database/moderationdb.js
const { pool } = require('./database');

const createModerationTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mutes (
      guild_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      expiration_time BIGINT,
      PRIMARY KEY (guild_id, user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS warnings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      moderator_id VARCHAR(255) NOT NULL,
      reason TEXT,
      timestamp BIGINT NOT NULL
    )
  `);

  await pool.query(`
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
};

const addMute = async (guildId, userId, expirationTime) => {
  await pool.query(
    'INSERT INTO mutes (guild_id, user_id, expiration_time) VALUES (?, ?, ?)',
    [guildId, userId, expirationTime]
  );
};

const removeMute = async (guildId, userId) => {
  await pool.query(
    'DELETE FROM mutes WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );
};

const getMute = async (guildId, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM mutes WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );
  return rows[0];
};

const addWarning = async (guildId, userId, moderatorId, reason) => {
  await pool.query(
    'INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
    [guildId, userId, moderatorId, reason, Date.now()]
  );
};

const getWarnings = async (guildId, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );
  return rows;
};

const clearWarnings = async (guildId, userId) => {
  await pool.query(
    'DELETE FROM warnings WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );
};

const addModerationLog = async (guildId, moderatorId, action, targetId, reason) => {
  await pool.query(
    'INSERT INTO moderation_logs (guild_id, moderator_id, action, target_id, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [guildId, moderatorId, action, targetId, reason, Date.now()]
  );
};

const getModerationLogs = async (guildId) => {
  const [rows] = await pool.query(
    'SELECT * FROM moderation_logs WHERE guild_id = ? ORDER BY timestamp DESC',
    [guildId]
  );
  return rows;
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
