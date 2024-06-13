// src/database/ecodb.js
const { pool } = require('./database');

const createEconomyTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS economy (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guildId VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
      UNIQUE KEY unique_user_balance (guildId, userId)
    )
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating economy table:', error);
    } else {
    }
  });
};

const createEcoSettingsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS eco_settings (
      guild_id VARCHAR(255) NOT NULL,
      setting_name VARCHAR(255) NOT NULL,
      setting_value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      PRIMARY KEY (guild_id, setting_name)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating eco_settings table:', error);
    } else {
    }
  });
};

const getBalance = (guildId, userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT balance FROM economy WHERE guildId = ? AND userId = ?',
      [guildId, userId],
      (error, results) => {
        if (error) {
          console.error('Error getting balance:', error);
          reject(error);
        } else {
          const balance = results.length > 0 ? results[0].balance : 0;
          resolve(balance);
        }
      }
    );
  });
};

const setBalance = (guildId, userId, balance) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO economy (guildId, userId, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = VALUES(balance)',
      [guildId, userId, balance],
      (error) => {
        if (error) {
          console.error('Error setting balance:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const addBalance = (guildId, userId, amount) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO economy (guildId, userId, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)',
      [guildId, userId, amount],
      (error) => {
        if (error) {
          console.error('Error adding balance:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeBalance = (guildId, userId, amount) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE economy SET balance = GREATEST(0, balance - ?) WHERE guildId = ? AND userId = ?',
      [amount, guildId, userId],
      (error) => {
        if (error) {
          console.error('Error removing balance:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getEcoSetting = (guildId, settingName, defaultValue = null) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT setting_value FROM eco_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, settingName],
      (error, results) => {
        if (error) {
          console.error('Error getting eco setting:', error);
          reject(error);
        } else {
          const settingValue = results.length > 0 ? results[0].setting_value : defaultValue;
          resolve(settingValue);
        }
      }
    );
  });
};

const setEcoSetting = (guildId, settingName, settingValue) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO eco_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, settingName, settingValue],
      (error) => {
        if (error) {
          console.error('Error setting eco setting:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

module.exports = {
  createEconomyTable,
  createEcoSettingsTable,
  getBalance,
  setBalance,
  addBalance,
  removeBalance,
  getEcoSetting,
  setEcoSetting,
};
