// src/database/userProfiles.js
const { pool } = require('./database');

async function createUserProfilesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        about_me TEXT,
        links JSON,
        birthday VARCHAR(255),
        location VARCHAR(255),
        interests JSON,
        story TEXT,
        UNIQUE KEY unique_user_profile (user_id, guild_id)
      )
    `);
    console.log('User profiles table created or already exists.');
  } catch (error) {
    console.error('Error creating user_profiles table:', error);
  }
}

async function getUserProfile(userId, guildId) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );
    if (rows.length > 0) {
      const profile = rows[0];
      return {
        aboutMe: profile.about_me,
        links: profile.links ? JSON.parse(profile.links) : [],
        birthday: profile.birthday,
        location: profile.location,
        interests: profile.interests ? JSON.parse(profile.interests) : [],
        story: profile.story,
      };
    } else {
      return {
        aboutMe: '',
        links: [],
        birthday: '',
        location: '',
        interests: [],
        story: '',
      };
    }
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    throw error;
  }
}

async function updateUserProfile(userId, guildId, profileData) {
  try {
    await pool.execute(
      'INSERT INTO user_profiles (user_id, guild_id, about_me, links, birthday, location, interests, story) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE about_me = VALUES(about_me), links = VALUES(links), birthday = VALUES(birthday), location = VALUES(location), interests = VALUES(interests), story = VALUES(story)',
      [
        userId,
        guildId,
        profileData.aboutMe || null,
        profileData.links ? JSON.stringify(profileData.links) : null,
        profileData.birthday || null,
        profileData.location || null,
        profileData.interests ? JSON.stringify(profileData.interests) : null,
        profileData.story || null,
      ]
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

module.exports = {
  createUserProfilesTable,
  getUserProfile,
  updateUserProfile,
};
