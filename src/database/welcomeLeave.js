// src/database/welcomeLeave.js
const { pool } = require('./database');

async function createWelcomeLeaveTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS welcome_leave (
        guild_id VARCHAR(255) PRIMARY KEY,
        welcome_channel_id VARCHAR(255),
        welcome_message TEXT,
        leave_channel_id VARCHAR(255),
        leave_message TEXT
      )
    `);
  } catch (error) {
    console.error('Error creating welcome_leave table:', error);
  }
}

async function getWelcomeMessage(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT welcome_message FROM welcome_leave WHERE guild_id = ?',
      [guildId]
    );
    return rows.length > 0 ? rows[0].welcome_message : null;
  } catch (error) {
    console.error('Error getting welcome message:', error);
    throw error;
  }
}

async function setWelcomeMessage(guildId, message) {
  try {
    await pool.execute(
      'INSERT INTO welcome_leave (guild_id, welcome_message) VALUES (?, ?) ON DUPLICATE KEY UPDATE welcome_message = VALUES(welcome_message)',
      [guildId, message]
    );
  } catch (error) {
    console.error('Error setting welcome message:', error);
    throw error;
  }
}

async function getLeaveMessage(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT leave_message FROM welcome_leave WHERE guild_id = ?',
      [guildId]
    );
    return rows.length > 0 ? rows[0].leave_message : null;
  } catch (error) {
    console.error('Error getting leave message:', error);
    throw error;
  }
}

async function setLeaveMessage(guildId, message) {
  try {
    await pool.execute(
      'INSERT INTO welcome_leave (guild_id, leave_message) VALUES (?, ?) ON DUPLICATE KEY UPDATE leave_message = VALUES(leave_message)',
      [guildId, message]
    );
  } catch (error) {
    console.error('Error setting leave message:', error);
    throw error;
  }
}

async function getWelcomeChannelId(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT welcome_channel_id FROM welcome_leave WHERE guild_id = ?',
      [guildId]
    );
    return rows.length > 0 ? rows[0].welcome_channel_id : null;
  } catch (error) {
    console.error('Error getting welcome channel ID:', error);
    throw error;
  }
}

async function setWelcomeChannelId(guildId, channelId) {
  try {
    await pool.execute(
      'INSERT INTO welcome_leave (guild_id, welcome_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE welcome_channel_id = VALUES(welcome_channel_id)',
      [guildId, channelId]
    );
  } catch (error) {
    console.error('Error setting welcome channel ID:', error);
    throw error;
  }
}

async function getLeaveChannelId(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT leave_channel_id FROM welcome_leave WHERE guild_id = ?',
      [guildId]
    );
    return rows.length > 0 ? rows[0].leave_channel_id : null;
  } catch (error) {
    console.error('Error getting leave channel ID:', error);
    throw error;
  }
}

async function setLeaveChannelId(guildId, channelId) {
  try {
    await pool.execute(
      'INSERT INTO welcome_leave (guild_id, leave_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE leave_channel_id = VALUES(leave_channel_id)',
      [guildId, channelId]
    );
  } catch (error) {
    console.error('Error setting leave channel ID:', error);
    throw error;
  }
}

module.exports = {
  createWelcomeLeaveTable,
  getWelcomeMessage,
  setWelcomeMessage,
  getLeaveMessage,
  setLeaveMessage,
  getWelcomeChannelId,
  setWelcomeChannelId,
  getLeaveChannelId,
  setLeaveChannelId,
};
