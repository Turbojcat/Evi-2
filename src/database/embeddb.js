// src/database/embeddb.js
const { pool } = require('./database');

async function createEmbedTable() {
  try {
    const connection = await pool.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS custom_embeds (
        id INT AUTO_INCREMENT,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        embed_data JSON NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (user_id, guild_id, id)
      )
    `);
    connection.release();
  } catch (error) {
    console.error('Error creating custom embeds table:', error);
  }
}

async function createEmbed(userId, guildId, embedData) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO custom_embeds (user_id, guild_id, embed_data) VALUES (?, ?, ?)',
      [userId, guildId, JSON.stringify(embedData)]
    );
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error creating custom embed:', error);
    return null;
  }
}

async function getEmbed(userId, guildId, embedId) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT embed_data FROM custom_embeds WHERE user_id = ? AND guild_id = ? AND id = ?',
      [userId, guildId, embedId]
    );
    connection.release();

    if (rows.length === 0) {
      return null;
    }

    const embedData = JSON.parse(rows[0].embed_data);
    return embedData;
  } catch (error) {
    console.error('Error retrieving custom embed:', error);
    return null;
  }
}

async function getEmbeds(userId, guildId) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, embed_data FROM custom_embeds WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );
    connection.release();

    const embeds = rows.map((row) => ({
      id: row.id,
      data: JSON.parse(row.embed_data),
    }));

    return embeds;
  } catch (error) {
    console.error('Error retrieving custom embeds:', error);
    return [];
  }
}

async function updateEmbed(userId, guildId, embedId, embedData) {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE custom_embeds SET embed_data = ? WHERE user_id = ? AND guild_id = ? AND id = ?',
      [JSON.stringify(embedData), userId, guildId, embedId]
    );
    connection.release();
    return true;
  } catch (error) {
    console.error('Error updating custom embed:', error);
    return false;
  }
}

async function deleteEmbed(userId, guildId, embedId) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'DELETE FROM custom_embeds WHERE user_id = ? AND guild_id = ? AND id = ?',
      [userId, guildId, embedId]
    );
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting custom embed:', error);
    return false;
  }
}

async function getEmbedCount(userId, guildId) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT COUNT(*) AS count FROM custom_embeds WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );
    connection.release();
    return rows[0].count;
  } catch (error) {
    console.error('Error retrieving custom embed count:', error);
    return 0;
  }
}

module.exports = {
  createEmbedTable,
  createEmbed,
  getEmbed,
  getEmbeds,
  updateEmbed,
  deleteEmbed,
  getEmbedCount,
};
