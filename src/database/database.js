// src/database/database.js
const mysql = require('mysql');
const { dbConfig } = require('../config');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
  connection.release();
});

const setupDatabase = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS premium_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      endDate TIMESTAMP NULL,
      UNIQUE KEY unique_user (userId)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during premium_subscriptions table creation:', err);
        return;
      }
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS role_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guildId VARCHAR(255) NOT NULL,
      roleId VARCHAR(255) NOT NULL,
      permissionLevel VARCHAR(255) NOT NULL,
      UNIQUE KEY unique_role_permission (guildId, roleId)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during role_permissions table creation:', err);
        return;
      }
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS guild_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      setting_name VARCHAR(255) NOT NULL,
      setting_value VARCHAR(255) NOT NULL,
      UNIQUE KEY unique_setting (guild_id, setting_name)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during guild_settings table creation:', err);
        return;
      }
    }
  );


  pool.query(
    `CREATE TABLE IF NOT EXISTS custom_commands (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      command VARCHAR(255) NOT NULL,
      response TEXT NOT NULL,
      UNIQUE KEY unique_custom_command (guild_id, command)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during custom_commands table creation:', err);
        return;
      }
    }
  );

  createUserProfilesTable();
};

const getRolePermissionLevel = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT permissionLevel FROM role_permissions WHERE guildId = ? AND roleId = ?';
    pool.query(query, [guildId, roleId], (err, results) => {
      if (err) {
        console.error('Error getting role permission level:', err);
        resolve('normal');
      } else {
        resolve(results.length > 0 ? results[0].permissionLevel : 'normal');
      }
    });
  });
};

const addOwnerRole = (guildId, ownerId) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO role_permissions (guildId, roleId, permissionLevel) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permissionLevel = VALUES(permissionLevel)';
    pool.query(query, [guildId, ownerId, 'owner'], (err) => {
      if (err) {
        console.error('Error adding owner role:', err);
        reject();
      } else {
        resolve();
      }
    });
  });
};

const hasPremiumSubscription = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM premium_subscriptions WHERE userId = ? AND endDate > CURRENT_TIMESTAMP';
    pool.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error checking premium subscription:', err);
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};

const addPremiumSubscription = (userId, endDate) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO premium_subscriptions (userId, endDate) VALUES (?, ?) ON DUPLICATE KEY UPDATE endDate = VALUES(endDate)';
    pool.query(query, [userId, endDate], (err) => {
      if (err) {
        console.error('Error adding premium subscription:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


const removePremiumSubscription = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM premium_subscriptions WHERE userId = ?';
    pool.query(query, [userId], (err) => {
      if (err) {
        console.error('Error removing premium subscription:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const setStoryChannel = (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, 'story_channel', channelId],
      (err) => {
        if (err) {
          console.error('Error setting story channel:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const getStoryChannel = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'story_channel'],
      (err, results) => {
        if (err) {
          console.error('Error getting story channel:', err);
          reject(err);
        } else {
          const storyChannel = results.length > 0 ? results[0].setting_value : null;
          resolve(storyChannel);
        }
      }
    );
  });
};

const removeStoryChannel = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'story_channel'],
      (err) => {
        if (err) {
          console.error('Error removing story channel:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const getStoryChannels = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT guild_id, setting_value FROM guild_settings WHERE setting_name = ?',
      ['story_channel'],
      (err, results) => {
        if (err) {
          console.error('Error getting story channels:', err);
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const addCustomCommand = (guildId, command, response) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO custom_commands (guild_id, command, response) VALUES (?, ?, ?)',
      [guildId, command, response],
      (err) => {
        if (err) {
          console.error('Error adding custom command:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeCustomCommand = (guildId, command) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM custom_commands WHERE guild_id = ? AND command = ?',
      [guildId, command],
      (err) => {
        if (err) {
          console.error('Error removing custom command:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const executeCustomCommand = (guildId, command) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT response FROM custom_commands WHERE guild_id = ? AND command = ?',
      [guildId, command],
      (err, results) => {
        if (err) {
          console.error('Error executing custom command:', err);
          reject(err);
        } else {
          const response = results.length > 0 ? results[0].response : null;
          resolve(response);
        }
      }
    );
  });
};

const getCustomCommands = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT command, response FROM custom_commands WHERE guild_id = ?',
      [guildId],
      (err, results) => {
        if (err) {
          console.error('Error getting custom commands:', err);
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const getCustomCommandLimit = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'custom_command_limit'],
      (err, results) => {
        if (err) {
          console.error('Error getting custom command limit:', err);
          reject(err);
        } else {
          const limit = results.length > 0 ? parseInt(results[0].setting_value) : 10;
          resolve(limit);
        }
      }
    );
  });
};

const setCustomCommandLimit = (guildId, limit) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, 'custom_command_limit', limit],
      (err) => {
        if (err) {
          console.error('Error setting custom command limit:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const createUserProfilesTable = () => {
  const sql = `
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
  `;

  pool.query(sql, (error) => {
    if (error) {
      console.error('Error creating user_profiles table:', error);
    } else {
    }
  });
};

module.exports = {
  pool,
  setupDatabase,
  hasPremiumSubscription,
  getRolePermissionLevel,
  addOwnerRole,
  addPremiumSubscription,
  removePremiumSubscription,
  setStoryChannel,
  getStoryChannel,
  removeStoryChannel,
  getStoryChannels,
  addCustomCommand,
  removeCustomCommand,
  executeCustomCommand,
  getCustomCommands,
  getCustomCommandLimit,
  setCustomCommandLimit,
  createUserProfilesTable,
};
