// src/database/automoddb.js
const { pool } = require('./database');

async function createAutoModTables() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS automod_settings (
        guild_id VARCHAR(255) PRIMARY KEY,
        word_filter BOOLEAN DEFAULT FALSE,
        spam_filter BOOLEAN DEFAULT FALSE,
        link_blocker BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS automod_wordlist (
        guild_id VARCHAR(255),
        word VARCHAR(255),
        PRIMARY KEY (guild_id, word)
      )
    `);

  } catch (error) {
    console.error('Error creating AutoMod tables:', error);
  }
}

async function setAutoModSetting(guildId, setting, value) {
  try {
    await pool.execute(
      `INSERT INTO automod_settings (guild_id, ${setting}) VALUES (?, ?) ON DUPLICATE KEY UPDATE ${setting} = VALUES(${setting})`,
      [guildId, value]
    );
  } catch (error) {
    console.error(`Error setting AutoMod ${setting}:`, error);
  }
}

async function getAutoModSettings(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM automod_settings WHERE guild_id = ?',
      [guildId]
    );
    return rows[0] || {};
  } catch (error) {
    console.error('Error getting AutoMod settings:', error);
    return {};
  }
}

async function addWordToFilter(guildId, word) {
  try {
    await pool.execute(
      'INSERT INTO automod_wordlist (guild_id, word) VALUES (?, ?)',
      [guildId, word.toLowerCase()]
    );
  } catch (error) {
    console.error('Error adding word to filter:', error);
  }
}

async function removeWordFromFilter(guildId, word) {
  try {
    await pool.execute(
      'DELETE FROM automod_wordlist WHERE guild_id = ? AND word = ?',
      [guildId, word.toLowerCase()]
    );
  } catch (error) {
    console.error('Error removing word from filter:', error);
  }
}

async function getWordList(guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT word FROM automod_wordlist WHERE guild_id = ?',
      [guildId]
    );
    return rows.map(row => row.word);
  } catch (error) {
    console.error('Error getting word list:', error);
    return [];
  }
}

async function deleteWordList(guildId) {
  try {
    await pool.execute(
      'DELETE FROM automod_wordlist WHERE guild_id = ?',
      [guildId]
    );
  } catch (error) {
    console.error('Error deleting word list:', error);
  }
}

module.exports = {
  createAutoModTables,
  setAutoModSetting,
  getAutoModSettings,
  addWordToFilter,
  removeWordFromFilter,
  getWordList,
  deleteWordList,
};
