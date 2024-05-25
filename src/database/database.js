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
      console.log('Premium subscriptions table created or already exists');
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
      console.log('Role permissions table created or already exists');
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
      console.log('Guild settings table created or already exists');
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS economy (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guildId VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
      UNIQUE KEY unique_user_balance (guildId, userId)
    )`,
    (err, results) => {
      if (err) {
        console.error('Error during economy table creation:', err);
        return;
      }
      console.log('Economy table created or already exists');
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
      console.log('Custom commands table created or already exists');
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

const setAdminRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO role_permissions (guildId, roleId, permissionLevel) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permissionLevel = VALUES(permissionLevel)',
      [guildId, roleId, 'admin'],
      (err) => {
        if (err) {
          console.error('Error setting admin role:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const getAdminRole = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT roleId FROM role_permissions WHERE guildId = ? AND permissionLevel = ?',
      [guildId, 'admin'],
      (err, results) => {
        if (err) {
          console.error('Error getting admin role:', err);
          reject(err);
        } else {
          const adminRoles = results.map((row) => row.roleId);
          resolve(adminRoles);
        }
      }
    );
  });
};

const removeAdminRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM role_permissions WHERE guildId = ? AND roleId = ? AND permissionLevel = ?',
      [guildId, roleId, 'admin'],
      (err) => {
        if (err) {
          console.error('Error removing admin role:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const setModeratorRole = (guildId, roleId) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO role_permissions (guildId, roleId, permissionLevel) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permissionLevel = VALUES(permissionLevel)';
    pool.query(query, [guildId, roleId, 'moderator'], (err) => {
      if (err) {
        console.error('Error setting moderator role:', err);
        reject();
      } else {
        resolve();
      }
    });
  });
};

const getModeratorRole = (guildId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT roleId FROM role_permissions WHERE guildId = ? AND permissionLevel = ?';
    pool.query(query, [guildId, 'moderator'], (err, results) => {
      if (err) {
        console.error('Error getting moderator role:', err);
        resolve(null);
      } else {
        resolve(results.length > 0 ? results[0].roleId : null);
      }
    });
  });
};

const removeModeratorRole = (guildId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM role_permissions WHERE guildId = ? AND permissionLevel = ?';
    pool.query(query, [guildId, 'moderator'], (err) => {
      if (err) {
        console.error('Error removing moderator role:', err);
        reject();
      } else {
        resolve();
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
    const query = 'INSERT INTO premium_subscriptions (userId, endDate) VALUES (?, ?)';
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
}

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

const getBalance = (guildId, userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT balance FROM economy WHERE guildId = ? AND userId = ?',
      [guildId, userId],
      (err, results) => {
        if (err) {
          console.error('Error getting balance:', err);
          reject(err);
        } else {
          const balance = results.length > 0 ? results[0].balance : 0;
          resolve(balance);
        }
      }
    );
  });
};

const setBalance = (guildId, userId, balance) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO economy (guildId, userId, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = VALUES(balance)',
      [guildId, userId, balance],
      (err) => {
        if (err) {
          console.error('Error setting balance:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const addBalance = (guildId, userId, amount) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO economy (guildId, userId, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)',
      [guildId, userId, amount],
      (err) => {
        if (err) {
          console.error('Error adding balance:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const removeBalance = (guildId, userId, amount) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE economy SET balance = GREATEST(0, balance - ?) WHERE guildId = ? AND userId = ?',
      [amount, guildId, userId],
      (err) => {
        if (err) {
          console.error('Error removing balance:', err);
          reject(err);
        } else {
          resolve();
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

const isSuggestionBlacklisted = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM suggestion_blacklist WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Error checking suggestion blacklist:', err);
          reject(err);
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
      (err) => {
        if (err) {
          console.error('Error adding user to suggestion blacklist:', err);
          reject(err);
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
      (err) => {
        if (err) {
          console.error('Error removing user from suggestion blacklist:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const setWelcomeChannel = (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, 'welcome_channel', channelId],
      (err) => {
        if (err) {
          console.error('Error setting welcome channel:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const getWelcomeChannel = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'welcome_channel'],
      (err, results) => {
        if (err) {
          console.error('Error getting welcome channel:', err);
          reject(err);
        } else {
          const welcomeChannel = results.length > 0 ? results[0].setting_value : null;
          resolve(welcomeChannel);
        }
      }
    );
  });
};

const removeWelcomeChannel = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'welcome_channel'],
      (err) => {
        if (err) {
          console.error('Error removing welcome channel:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const setWelcomeMessage = (guildId, message) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [guildId, 'welcome_message', message],
      (err) => {
        if (err) {
          console.error('Error setting welcome message:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const getWelcomeMessage = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'welcome_message'],
      (err, results) => {
        if (err) {
          console.error('Error getting welcome message:', err);
          reject(err);
        } else {
          const welcomeMessage = results.length > 0 ? results[0].setting_value : null;
          resolve(welcomeMessage);
        }
      }
    );
  });
};

const removeWelcomeMessage = (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
      [guildId, 'welcome_message'],
      (err) => {
        if (err) {
          console.error('Error removing welcome message:', err);
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
      console.log('user_profiles table created successfully');
    }
  });
};

module.exports = {
  pool,
  setupDatabase,
  hasPremiumSubscription,
  getRolePermissionLevel,
  setAdminRole,
  getAdminRole,
  removeAdminRole,
  setModeratorRole,
  getModeratorRole,
  removeModeratorRole,
  addOwnerRole,
  addPremiumSubscription,
  removePremiumSubscription,
  setStoryChannel,
  getStoryChannel,
  removeStoryChannel,
  getStoryChannels,
  getBalance,
  setBalance,
  addBalance,
  removeBalance,
  addCustomCommand,
  removeCustomCommand,
  executeCustomCommand,
  getCustomCommands,
  getCustomCommandLimit,
  setCustomCommandLimit,
  isSuggestionBlacklisted,
  addSuggestionBlacklist,
  removeSuggestionBlacklist,
  setWelcomeChannel,
  getWelcomeChannel,
  removeWelcomeChannel,
  setWelcomeMessage,
  getWelcomeMessage,
  removeWelcomeMessage,
  createUserProfilesTable,
};
