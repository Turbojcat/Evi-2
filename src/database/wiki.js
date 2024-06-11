// src/database/wiki.js
const { pool } = require('./database');

const createWikiPageTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS wiki_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      page VARCHAR(255) NOT NULL,
      channel_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      fields JSON,
      UNIQUE KEY unique_wiki_page (guild_id, page)
    )
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating wiki_pages table:', error);
    } else {
    }
  });
};

const createWikiPage = (guildId, page, channelId, title, description, fields) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO wiki_pages (guild_id, page, channel_id, title, description, fields)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        channel_id = VALUES(channel_id),
        title = VALUES(title),
        description = VALUES(description),
        fields = VALUES(fields)
    `;

    pool.query(sql, [guildId, page, channelId, title, description, JSON.stringify(fields)], (error) => {
      if (error) {
        console.error('Error creating wiki page:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const removeWikiPage = (guildId, page) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM wiki_pages WHERE guild_id = ? AND page = ?';

    pool.query(sql, [guildId, page], (error) => {
      if (error) {
        console.error('Error removing wiki page:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const getWikiPages = (guildId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM wiki_pages WHERE guild_id = ?';

    pool.query(sql, [guildId], (error, results) => {
      if (error) {
        console.error('Error getting wiki pages:', error);
        reject(error);
      } else {
        const wikiPages = results.map((row) => ({
          page: row.page,
          channelId: row.channel_id,
          title: row.title,
          description: row.description,
          fields: JSON.parse(row.fields),
        }));
        resolve(wikiPages);
      }
    });
  });
};

const setWikiChannel = (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO guild_settings (guild_id, setting_name, setting_value)
      VALUES (?, 'wiki_channel', ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `;

    pool.query(sql, [guildId, channelId], (error) => {
      if (error) {
        console.error('Error setting wiki channel:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const getWikiChannel = (guildId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?';

    pool.query(sql, [guildId, 'wiki_channel'], (error, results) => {
      if (error) {
        console.error('Error getting wiki channel:', error);
        reject(error);
      } else {
        const channelId = results.length > 0 ? results[0].setting_value : null;
        resolve(channelId);
      }
    });
  });
};

const removeWikiChannel = (guildId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?';

    pool.query(sql, [guildId, 'wiki_channel'], (error) => {
      if (error) {
        console.error('Error removing wiki channel:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  createWikiPageTable,
  createWikiPage,
  removeWikiPage,
  getWikiPages,
  setWikiChannel,
  getWikiChannel,
  removeWikiChannel,
};
