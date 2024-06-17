// src/database/ecodb.js
const { pool } = require('./database');

async function createEconomyTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS economy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guildId VARCHAR(255) NOT NULL,
        userId VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        UNIQUE KEY unique_user_balance (guildId, userId)
      )
    `);
  } catch (error) {
    console.error('Error creating economy table:', error);
  }
}

async function createEcoSettingsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS eco_settings (
        guild_id VARCHAR(255) NOT NULL,
        setting_name VARCHAR(255) NOT NULL,
        setting_value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (guild_id, setting_name)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
  } catch (error) {
    console.error('Error creating eco_settings table:', error);
  }
}

async function getBalance(guildId, userId) {
  try {
    const [rows] = await pool.execute(
      'SELECT balance FROM economy WHERE guildId = ? AND userId = ?',
      [guildId, userId]
    );
    return rows.length > 0 ? rows[0].balance : 0;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
}

async function setBalance(guildId, userId, balance) {
  try {
    await pool.execute(
      'INSERT INTO economy (guildId, userId, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = VALUES(balance)',
      [guildId, userId, balance]
    );
  } catch (error) {
    console.error('Error setting balance:', error);
    throw error;
  }
}

async function addBalance(guildId, userId, amount) {
  try {
    await pool.execute(
      'INSERT INTO economy (guildId, userId, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)',
      [guildId, userId, amount]
    );
  } catch (error) {
    console.error('Error adding balance:', error);
    throw error;
  }
}

async function removeBalance(guildId, userId, amount) {
  try {
    await pool.execute(
      'UPDATE economy SET balance = GREATEST(0, balance - ?) WHERE guildId = ? AND userId = ?',
      [amount, guildId, userId]
    );
  } catch (error) {
    console.error('Error removing balance:', error);
    throw error;
  }
}

async function getEcoSetting(guildId, settingName, defaultValue = null) {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_value FROM eco_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, settingName]
    );
    return rows.length > 0 ? rows[0].setting_value : defaultValue;
  } catch (error) {
    console.error('Error getting eco setting:', error);
    throw error;
  }
}

async function setEcoSetting(guildId, settingName, settingValue) {
  try {
    await pool.execute(
      'INSERT INTO eco_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, settingName, settingValue]
    );
  } catch (error) {
    console.error('Error setting eco setting:', error);
    throw error;
  }
}

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
