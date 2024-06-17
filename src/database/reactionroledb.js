// src/database/reactionroledb.js
const { pool } = require('./database');

const createReactionRoleTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS reaction_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      message_id VARCHAR(255) NOT NULL,
      emoji VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
      role_id VARCHAR(255) NOT NULL,
      button_label VARCHAR(255),
      button_style VARCHAR(255),
      is_premium BOOLEAN NOT NULL DEFAULT FALSE,
      user_id VARCHAR(255),
      UNIQUE KEY unique_reaction_role (guild_id, message_id, emoji, button_label, user_id)
    )
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating reaction_roles table:', error);
    } else {
    }
  });
};

const addReactionRole = (guildId, messageId, emoji, roleId, userId, isPremium) => {
  return new Promise((resolve, reject) => {
    const emojiIdentifier = emoji.id || emoji.name || emoji;
    pool.query(
      'INSERT INTO reaction_roles (guild_id, message_id, emoji, role_id, user_id, is_premium) VALUES (?, ?, ?, ?, ?, ?)',
      [guildId, messageId, emojiIdentifier, roleId, userId, isPremium],
      (error) => {
        if (error) {
          console.error('Error adding reaction role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeReactionRole = (guildId, messageId, emoji) => {
  return new Promise((resolve, reject) => {
    const emojiIdentifier = emoji.id || emoji.name || emoji;
    pool.query(
      'DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ? AND emoji = ? COLLATE utf8mb4_bin',
      [guildId, messageId, emojiIdentifier],
      (error) => {
        if (error) {
          console.error('Error removing reaction role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const addButtonRole = (guildId, messageId, buttonLabel, buttonStyle, roleId, userId, isPremium) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO reaction_roles (guild_id, message_id, button_label, button_style, role_id, user_id, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [guildId, messageId, buttonLabel, buttonStyle, roleId, userId, isPremium],
      (error) => {
        if (error) {
          console.error('Error adding button role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeButtonRole = (guildId, messageId, buttonLabel) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ? AND button_label = ?',
      [guildId, messageId, buttonLabel],
      (error) => {
        if (error) {
          console.error('Error removing button role:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getReactionRoles = (guildId, messageId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT emoji, role_id, button_label, button_style, message_id FROM reaction_roles WHERE guild_id = ? AND message_id = ?',
      [guildId, messageId],
      (error, results) => {
        if (error) {
          console.error('Error getting reaction roles:', error);
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const removeReactionRoleByUser = (guildId, messageId, emoji, userId) => {
  return new Promise((resolve, reject) => {
    const emojiIdentifier = emoji.id || emoji.name || emoji;
    pool.query(
      'DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ? AND emoji = ? COLLATE utf8mb4_bin AND user_id = ?',
      [guildId, messageId, emojiIdentifier, userId],
      (error) => {
        if (error) {
          console.error('Error removing reaction role by user:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeButtonRoleByUser = (guildId, messageId, buttonLabel, userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ? AND button_label = ? AND user_id = ?',
      [guildId, messageId, buttonLabel, userId],
      (error) => {
        if (error) {
          console.error('Error removing button role by user:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeAllReactionRoles = (guildId, messageId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ?',
      [guildId, messageId],
      (error) => {
        if (error) {
          console.error('Error removing all reaction roles:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const getMessageIdsWithReactionRoles = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT DISTINCT message_id FROM reaction_roles WHERE guild_id = ?',
      [guildId],
      (error, results) => {
        if (error) {
          console.error('Error getting message IDs with reaction roles:', error);
          reject(error);
        } else {
          const messageIds = results.map((row) => row.message_id);
          resolve(messageIds);
        }
      }
    );
  });
};

module.exports = {
  createReactionRoleTable,
  addReactionRole,
  removeReactionRole,
  addButtonRole,
  removeButtonRole,
  getReactionRoles,
  removeReactionRoleByUser,
  removeButtonRoleByUser,
  removeAllReactionRoles,
  getMessageIdsWithReactionRoles,
};
