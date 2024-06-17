// src/database/wiki.js
const { pool } = require('./database');

async function createWikiPageTable() {
  try {
    await pool.execute(`
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
    `);
  } catch (error) {
    console.error('Error creating wiki_pages table:', error);
  }
}

async function createWikiPage(guildId, page, channelId, title, description, fields) {
  try {
    const sql = `
      INSERT INTO wiki_pages (guild_id, page, channel_id, title, description, fields)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        channel_id = VALUES(channel_id),
        title = VALUES(title),
        description = VALUES(description),
        fields = VALUES(fields)
    `;

    await pool.execute(sql, [guildId, page, channelId, title, description, JSON.stringify(fields)]);
  } catch (error) {
    console.error('Error creating wiki page:', error);
    throw error;
  }
}

async function removeWikiPage(guildId, page) {
  try {
    const sql = 'DELETE FROM wiki_pages WHERE guild_id = ? AND page = ?';
    await pool.execute(sql, [guildId, page]);
  } catch (error) {
    console.error('Error removing wiki page:', error);
    throw error;
  }
}

async function getWikiPages(guildId) {
  try {
    const sql = 'SELECT * FROM wiki_pages WHERE guild_id = ?';
    const [results] = await pool.execute(sql, [guildId]);
    return results.map((row) => ({
      page: row.page,
      channelId: row.channel_id,
      title: row.title,
      description: row.description,
      fields: JSON.parse(row.fields),
    }));
  } catch (error) {
    console.error('Error getting wiki pages:', error);
    throw error;
  }
}

async function setWikiChannel(guildId, channelId) {
  try {
    const sql = `
      INSERT INTO guild_settings (guild_id, setting_name, setting_value)
      VALUES (?, 'wiki_channel', ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `;
    await pool.execute(sql, [guildId, channelId]);
  } catch (error) {
    console.error('Error setting wiki channel:', error);
    throw error;
  }
}

async function getWikiChannel(guildId) {
  try {
    const sql = 'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?';
    const [results] = await pool.execute(sql, [guildId, 'wiki_channel']);
    return results.length > 0 ? results[0].setting_value : null;
  } catch (error) {
    console.error('Error getting wiki channel:', error);
    throw error;
  }
}

async function removeWikiChannel(guildId) {
  try {
    const sql = 'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?';
    await pool.execute(sql, [guildId, 'wiki_channel']);
  } catch (error) {
    console.error('Error removing wiki channel:', error);
    throw error;
  }
}

module.exports = {
  createWikiPageTable,
  createWikiPage,
  removeWikiPage,
  getWikiPages,
  setWikiChannel,
  getWikiChannel,
  removeWikiChannel,
};
