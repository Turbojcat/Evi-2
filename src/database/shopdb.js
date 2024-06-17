// src/database/shopdb.js
const { pool } = require('./database');

async function createShopItemTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id INT AUTO_INCREMENT,
      guild_id VARCHAR(255) NOT NULL,
      category_id INT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);
}

async function createShopCategoryTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function addDescriptionColumnToShopCategories() {
  const [rows] = await pool.query(`
    SHOW COLUMNS FROM shop_categories LIKE 'description'
  `);

  if (rows.length === 0) {
    await pool.query(`
      ALTER TABLE shop_categories
      ADD COLUMN description TEXT
    `);
  }
}

async function createShopPurchaseTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_purchases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      item_id INT NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function createShopRoleTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      category_id INT,
      role_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function addShopCategory(guildId, name, description) {
  const [result] = await pool.query(
    'INSERT INTO shop_categories (guild_id, name, description) VALUES (?, ?, ?)',
    [guildId, name, description]
  );
  return result.insertId;
}

async function getShopCategories(guildId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_categories WHERE guild_id = ?',
    [guildId]
  );
  return rows;
}

async function getShopCategory(categoryId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_categories WHERE id = ?',
    [categoryId]
  );
  return rows[0];
}

async function updateShopCategory(categoryId, name, description) {
  await pool.query(
    'UPDATE shop_categories SET name = ?, description = ? WHERE id = ?',
    [name, description, categoryId]
  );
}

async function deleteShopCategory(categoryId) {
  await pool.query(
    'DELETE FROM shop_categories WHERE id = ?',
    [categoryId]
  );
}

async function addShopItem(guildId, categoryId, name, description, price, imageUrl) {
  const [result] = await pool.query(
    'INSERT INTO shop_items (guild_id, category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [guildId, categoryId, name, description, price, imageUrl]
  );
  return result.insertId;
}

async function getShopItems(guildId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE guild_id = ?',
    [guildId]
  );
  return rows;
}

async function getShopItem(itemId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE id = ?',
    [itemId]
  );
  return rows[0];
}

async function updateShopItem(itemId, categoryId, name, description, price, imageUrl) {
  await pool.query(
    'UPDATE shop_items SET category_id = ?, name = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
    [categoryId, name, description, price, imageUrl, itemId]
  );
}

async function deleteShopItem(itemId) {
  await pool.query(
    'DELETE FROM shop_items WHERE id = ?',
    [itemId]
  );
}

async function getItemsByCategory(guildId, categoryId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE guild_id = ? AND category_id = ?',
    [guildId, categoryId]
  );
  return rows;
}

async function addShopRole(guildId, categoryId, roleId, name, description, price) {
  const [result] = await pool.query(
    'INSERT INTO shop_roles (guild_id, category_id, role_id, name, description, price) VALUES (?, ?, ?, ?, ?, ?)',
    [guildId, categoryId, roleId, name, description, price]
  );
  return result.insertId;
}

async function getRoles(guildId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_roles WHERE guild_id = ?',
    [guildId]
  );
  return rows;
}

async function getRole(roleId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_roles WHERE id = ?',
    [roleId]
  );
  return rows[0];
}

async function updateShopRole(roleId, categoryId, name, description, price) {
  await pool.query(
    'UPDATE shop_roles SET category_id = ?, name = ?, description = ?, price = ? WHERE id = ?',
    [categoryId, name, description, price, roleId]
  );
}

async function deleteShopRole(roleId) {
  await pool.query(
    'DELETE FROM shop_roles WHERE id = ?',
    [roleId]
  );
}

async function getRolesByCategory(guildId, categoryId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_roles WHERE guild_id = ? AND category_id = ?',
    [guildId, categoryId]
  );
  return rows;
}

async function getRoleCount(guildId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM shop_roles WHERE guild_id = ?',
    [guildId]
  );
  return rows[0].count;
}

async function buyItem(userId, itemId) {
  // Implement the logic to handle the purchase of an item by a user
  // This may involve updating the user's balance, adding the item to their inventory, etc.
  return true;
}

async function buyRole(userId, roleId) {
  // Implement the logic to handle the purchase of a role by a user
  // This may involve updating the user's balance, assigning the role to the user, etc.
  return true;
}

async function sellItem(userId, itemId) {
  // Implement the logic to handle the selling of an item by a user
  // This may involve updating the user's balance, removing the item from their inventory, etc.
  return true;
}

async function sellRole(userId, roleId) {
  // Implement the logic to handle the selling of a role by a user
  // This may involve updating the user's balance, removing the role from the user, etc.
  return true;
}

async function purchaseShopItem(guildId, userId, itemId, quantity, totalPrice) {
  await pool.query(
    'INSERT INTO shop_purchases (guild_id, user_id, item_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)',
    [guildId, userId, itemId, quantity, totalPrice]
  );
}

async function getShopPurchases(guildId, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM shop_purchases WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );
  return rows;
}

async function getItemCount(guildId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM shop_items WHERE guild_id = ?',
    [guildId]
  );
  return rows[0].count;
}

async function getCategoryCount(guildId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM shop_categories WHERE guild_id = ?',
    [guildId]
  );
  return rows[0].count;
}

module.exports = {
  createShopItemTable,
  createShopCategoryTable,
  addDescriptionColumnToShopCategories,
  createShopPurchaseTable,
  createShopRoleTable,
  addShopCategory,
  getShopCategories,
  getShopCategory,
  updateShopCategory,
  deleteShopCategory,
  addShopItem,
  getShopItems,
  getShopItem,
  updateShopItem,
  deleteShopItem,
  getItemsByCategory,
  addShopRole,
  getRoles,
  getRole,
  updateShopRole,
  deleteShopRole,
  getRolesByCategory,
  getRoleCount,
  buyItem,
  buyRole,
  sellItem,
  sellRole,
  purchaseShopItem,
  getShopPurchases,
  getItemCount,
  getCategoryCount,
};
