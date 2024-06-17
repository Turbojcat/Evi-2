// src/database/suggestiondb.js
const { pool } = require('./database');

async function createSuggestionTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        suggestion TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.execute(`
      ALTER TABLE suggestions
      ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'pending'
    `);

  } catch (error) {
    console.error('Error creating suggestions table:', error);
  }
}

async function createSuggestion(userId, guildId, suggestion) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO suggestions (user_id, guild_id, suggestion) VALUES (?, ?, ?)',
      [userId, guildId, suggestion]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error saving suggestion:', error);
    throw error;
  }
}

async function getNewSuggestions() {
  try {
    const [rows] = await pool.execute('SELECT * FROM suggestions WHERE sent = FALSE');
    return rows;
  } catch (error) {
    console.error('Error getting new suggestions:', error);
    throw error;
  }
}

async function markSuggestionAsSent(suggestionId) {
  try {
    await pool.execute('UPDATE suggestions SET sent = TRUE WHERE id = ?', [suggestionId]);
  } catch (error) {
    console.error('Error marking suggestion as sent:', error);
    throw error;
  }
}

async function isSuggestionBlacklisted(userId) {
  try {
    const [rows] = await pool.execute('SELECT * FROM suggestion_blacklist WHERE user_id = ?', [userId]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking suggestion blacklist:', error);
    throw error;
  }
}

async function addSuggestionBlacklist(userId, reason) {
  try {
    await pool.execute('INSERT INTO suggestion_blacklist (user_id, reason) VALUES (?, ?)', [userId, reason]);
  } catch (error) {
    console.error('Error adding user to suggestion blacklist:', error);
    throw error;
  }
}

async function removeSuggestionBlacklist(userId) {
  try {
    await pool.execute('DELETE FROM suggestion_blacklist WHERE user_id = ?', [userId]);
  } catch (error) {
    console.error('Error removing user from suggestion blacklist:', error);
    throw error;
  }
}

async function updateSuggestionStatus(suggestionId, status) {
  try {
    await pool.execute('UPDATE suggestions SET status = ? WHERE id = ?', [status, suggestionId]);
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    throw error;
  }
}

module.exports = {
  createSuggestionTable,
  createSuggestion,
  getNewSuggestions,
  markSuggestionAsSent,
  isSuggestionBlacklisted,
  addSuggestionBlacklist,
  removeSuggestionBlacklist,
  updateSuggestionStatus,
};
