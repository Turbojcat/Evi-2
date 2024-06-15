// src/database/inventorydb.js
const { pool } = require('./database');

async function setupInventoryDatabase() {
  await dropTablesIfExist();
  await createTables();
}

async function dropTablesIfExist() {
  await pool.query('DROP TABLE IF EXISTS user_inventory');
  await pool.query('DROP TABLE IF EXISTS shop_items');
  await pool.query('DROP TABLE IF EXISTS inventory');
}

async function createTables() {
  await pool.query(`
    CREATE TABLE inventory (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE shop_items (
      id SERIAL PRIMARY KEY,
      inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE user_inventory (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      item_id INTEGER REFERENCES shop_items(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL
    )
  `);
}

async function addItem(name, description, price, quantity) {
  const { rows } = await pool.query(
    'INSERT INTO inventory (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, price, quantity]
  );
  const inventoryId = rows[0].id;
  await pool.query(
    'INSERT INTO shop_items (inventory_id) VALUES ($1)',
    [inventoryId]
  );
}

async function removeItem(itemId) {
  await pool.query(
    'DELETE FROM shop_items WHERE id = $1',
    [itemId]
  );
}

async function updateItem(itemId, name, description, price, quantity) {
  await pool.query(
    'UPDATE inventory SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = (SELECT inventory_id FROM shop_items WHERE id = $5)',
    [name, description, price, quantity, itemId]
  );
}

async function addToUserInventory(userId, itemId, quantity) {
  await pool.query(
    'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_inventory.quantity + EXCLUDED.quantity',
    [userId, itemId, quantity]
  );
}

async function removeFromUserInventory(userId, itemId, quantity) {
  await pool.query(
    'UPDATE user_inventory SET quantity = quantity - $1 WHERE user_id = $2 AND item_id = $3',
    [quantity, userId, itemId]
  );
}

async function getUserInventory(userId) {
  const { rows } = await pool.query(
    'SELECT i.id, i.name, i.description, ui.quantity FROM user_inventory ui JOIN shop_items si ON ui.item_id = si.id JOIN inventory i ON si.inventory_id = i.id WHERE ui.user_id = $1',
    [userId]
  );
  return rows;
}

async function getItemQuantity(userId, itemId) {
  const { rows } = await pool.query(
    'SELECT quantity FROM user_inventory WHERE user_id = $1 AND item_id = $2',
    [userId, itemId]
  );
  return rows.length > 0 ? rows[0].quantity : 0;
}

async function hasItem(userId, itemId) {
  const { rows } = await pool.query(
    'SELECT * FROM user_inventory WHERE user_id = $1 AND item_id = $2',
    [userId, itemId]
  );
  return rows.length > 0;
}

async function removeAllUserItems(userId) {
  await pool.query(
    'DELETE FROM user_inventory WHERE user_id = $1',
    [userId]
  );
}

module.exports = {
  setupInventoryDatabase,
  addItem,
  removeItem,
  updateItem,
  addToUserInventory,
  removeFromUserInventory,
  getUserInventory,
  getItemQuantity,
  hasItem,
  removeAllUserItems,
};
