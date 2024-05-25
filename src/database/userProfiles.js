// src/database/userProfiles.js
const { pool } = require('./database');

const getUserProfile = async (userId, guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ? AND guild_id = ?',
      [userId, guildId],
      (error, results) => {
        if (error) {
          console.error('Error retrieving user profile:', error);
          reject(error);
        } else {
          if (results.length > 0) {
            const profile = results[0];
            resolve({
              aboutMe: profile.about_me,
              links: profile.links ? JSON.parse(profile.links) : [],
              birthday: profile.birthday,
              location: profile.location,
              interests: profile.interests ? JSON.parse(profile.interests) : [],
              story: profile.story,
            });
          } else {
            resolve({
              aboutMe: '',
              links: [],
              birthday: '',
              location: '',
              interests: [],
              story: '',
            });
          }
        }
      }
    );
  });
};

const updateUserProfile = async (userId, guildId, profileData) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO user_profiles (user_id, guild_id, about_me, links, birthday, location, interests, story) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE about_me = VALUES(about_me), links = VALUES(links), birthday = VALUES(birthday), location = VALUES(location), interests = VALUES(interests), story = VALUES(story)',
      [
        userId,
        guildId,
        profileData.aboutMe,
        JSON.stringify(profileData.links),
        profileData.birthday,
        profileData.location,
        JSON.stringify(profileData.interests),
        profileData.story,
      ],
      (error) => {
        if (error) {
          console.error('Error updating user profile:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};