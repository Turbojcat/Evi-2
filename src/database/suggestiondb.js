// src/database/suggestion.js
const { pool } = require('./database');

// src/database/suggestiondb.js
const createSuggestionTable = () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS suggestions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      guild_id VARCHAR(255) NOT NULL,
      suggestion TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sent BOOLEAN DEFAULT FALSE
    )
  `;

  pool.query(createTableSql, (createTableError) => {
    if (createTableError) {
      console.error('Error creating suggestions table:', createTableError);
    } else {
      const alterTableSql = `
        ALTER TABLE suggestions
        ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'pending'
      `;

      pool.query(alterTableSql, (alterTableError) => {
        if (alterTableError) {
          console.error('Error adding status column to suggestions table:', alterTableError);
        } else {
        }
      });
    }
  });
};



const createSuggestion = (userId, guildId, suggestion) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO suggestions (user_id, guild_id, suggestion) VALUES (?, ?, ?)',
      [userId, guildId, suggestion],
      (error, results) => {
        if (error) {
          console.error('Error saving suggestion:', error);
          reject(error);
        } else {
          resolve(results.insertId);
        }
      }
    );
  });
};

const getNewSuggestions = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM suggestions WHERE sent = FALSE',
      (error, results) => {
        if (error) {
          console.error('Error getting new suggestions:', error);
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const markSuggestionAsSent = (suggestionId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE suggestions SET sent = TRUE WHERE id = ?',
      [suggestionId],
      (error) => {
        if (error) {
          console.error('Error marking suggestion as sent:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const isSuggestionBlacklisted = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM suggestion_blacklist WHERE user_id = ?',
      [userId],
      (error, results) => {
        if (error) {
          console.error('Error checking suggestion blacklist:', error);
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
};

const addSuggestionBlacklist = (userId, reason) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO suggestion_blacklist (user_id, reason) VALUES (?, ?)',
      [userId, reason],
      (error) => {
        if (error) {
          console.error('Error adding user to suggestion blacklist:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeSuggestionBlacklist = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM suggestion_blacklist WHERE user_id = ?',
      [userId],
      (error) => {
        if (error) {
          console.error('Error removing user from suggestion blacklist:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const updateSuggestionStatus = (suggestionId, status) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE suggestions SET status = ? WHERE id = ?',
      [status, suggestionId],
      (error) => {
        if (error) {
          console.error('Error updating suggestion status:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

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
