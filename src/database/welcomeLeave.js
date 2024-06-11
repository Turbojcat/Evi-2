// src/database/welcomeLeave.js
const { pool } = require('./database');

const createWelcomeLeaveTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS welcome_leave (
      guild_id VARCHAR(255) PRIMARY KEY,
      welcome_channel_id VARCHAR(255),
      welcome_message TEXT,
      leave_channel_id VARCHAR(255),
      leave_message TEXT
    )
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating welcome_leave table:', error);
    } else {
    }
  });
};

const getWelcomeMessage = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT welcome_message FROM welcome_leave WHERE guild_id = ?',
      [guildId],
      (error, results) => {
        if (error) {
          console.error('Error getting welcome message:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? results[0].welcome_message : null);
        }
      }
    );
  });
};

const setWelcomeMessage = (guildId, message) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO welcome_leave (guild_id, welcome_message) VALUES (?, ?) ON DUPLICATE KEY UPDATE welcome_message = VALUES(welcome_message)',
      [guildId, message],
      (error) => {
        if (error) {
          console.error('Error setting welcome message:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getLeaveMessage = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT leave_message FROM welcome_leave WHERE guild_id = ?',
      [guildId],
      (error, results) => {
        if (error) {
          console.error('Error getting leave message:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? results[0].leave_message : null);
        }
      }
    );
  });
};

const setLeaveMessage = (guildId, message) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO welcome_leave (guild_id, leave_message) VALUES (?, ?) ON DUPLICATE KEY UPDATE leave_message = VALUES(leave_message)',
      [guildId, message],
      (error) => {
        if (error) {
          console.error('Error setting leave message:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getWelcomeChannelId = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT welcome_channel_id FROM welcome_leave WHERE guild_id = ?',
      [guildId],
      (error, results) => {
        if (error) {
          console.error('Error getting welcome channel ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? results[0].welcome_channel_id : null);
        }
      }
    );
  });
};

const setWelcomeChannelId = (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO welcome_leave (guild_id, welcome_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE welcome_channel_id = VALUES(welcome_channel_id)',
      [guildId, channelId],
      (error) => {
        if (error) {
          console.error('Error setting welcome channel ID:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getLeaveChannelId = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT leave_channel_id FROM welcome_leave WHERE guild_id = ?',
      [guildId],
      (error, results) => {
        if (error) {
          console.error('Error getting leave channel ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? results[0].leave_channel_id : null);
        }
      }
    );
  });
};

const setLeaveChannelId = (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO welcome_leave (guild_id, leave_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE leave_channel_id = VALUES(leave_channel_id)',
      [guildId, channelId],
      (error) => {
        if (error) {
          console.error('Error setting leave channel ID:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

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
