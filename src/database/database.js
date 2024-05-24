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
};

const hasPremiumSubscription = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM premium_subscriptions WHERE userId = ? AND endDate > CURRENT_TIMESTAMP';
    pool.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error checking premium subscription:', err);
        reject(false);
      } else {
        resolve(results.length > 0);
      }
    });
  });
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
    const query = 'INSERT INTO role_permissions (guildId, roleId, permissionLevel) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permissionLevel = VALUES(permissionLevel)';
    pool.query(query, [guildId, roleId, 'admin'], (err) => {
      if (err) {
        console.error('Error setting admin role:', err);
        reject();
      } else {
        resolve();
      }
    });
  });
};

const getAdminRole = (guildId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT roleId FROM role_permissions WHERE guildId = ? AND permissionLevel = ?';
    pool.query(query, [guildId, 'admin'], (err, results) => {
      if (err) {
        console.error('Error getting admin role:', err);
        resolve(null);
      } else {
        resolve(results.length > 0 ? results[0].roleId : null);
      }
    });
  });
};

const removeAdminRole = (guildId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM role_permissions WHERE guildId = ? AND permissionLevel = ?';
    pool.query(query, [guildId, 'admin'], (err) => {
      if (err) {
        console.error('Error removing admin role:', err);
        reject();
      } else {
        resolve();
      }
    });
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

const addPremiumSubscription = (userId, endDate) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO premium_subscriptions (userId, endDate) VALUES (?, ?)';
    pool.query(query, [userId, endDate], (err) => {
      if (err) {
        console.error('Error adding premium subscription:', err);
        reject();
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
        reject();
      } else {
        resolve();
      }
    });
  });
};

const setStoryChannel = (guildId, channelId, callback) => {
  pool.query(
    'INSERT INTO guild_settings (guild_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
    [guildId, 'story_channel', channelId],
    (err) => {
      if (err) {
        console.error('Error setting story channel:', err);
        return callback(null);
      }
      callback();
    }
  );
};

const getStoryChannel = (guildId, callback) => {
  pool.query(
    'SELECT setting_value FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
    [guildId, 'story_channel'],
    (err, results) => {
      if (err) {
        console.error('Error getting story channel:', err);
        return callback(null);
      }
      const storyChannel = results.length > 0 ? results[0].setting_value : null;
      callback(storyChannel);
    }
  );
};

const removeStoryChannel = (guildId, callback) => {
  pool.query(
    'DELETE FROM guild_settings WHERE guild_id = ? AND setting_name = ?',
    [guildId, 'story_channel'],
    (err) => {
      if (err) {
        console.error('Error removing story channel:', err);
        return callback();
      }
      callback();
    }
  );
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
};
