import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open the database
export async function initDatabase() {
  const db = await open({
    filename: path.join(__dirname, 'nevrfade.db'),
    driver: sqlite3.Database
  });

  // Create products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price REAL NOT NULL,
      salePrice REAL,
      sku TEXT UNIQUE,
      variants TEXT, -- JSON string of variants
      images TEXT, -- JSON string of image URLs
      status TEXT DEFAULT 'Publish',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create admin sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      zipCode TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON string of items
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample products if table is empty
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    await db.run(`
      INSERT INTO products (name, description, category, price, variants, images, status)
      VALUES 
        ('Cyber Jacket', 'Premium cyberpunk jacket with neon accents', 'Jackets', 199.99, '[{"color":"#000000","size":"S","stock":5},{"color":"#000000","size":"M","stock":3},{"color":"#000000","size":"L","stock":2},{"color":"#FF0000","size":"S","stock":4},{"color":"#FF0000","size":"M","stock":6},{"color":"#FF0000","size":"L","stock":1}]', '["/product-1.png"]', 'Publish'),
        ('Neon Pants', 'Stylish neon pants for the urban explorer', 'Pants', 129.99, '[{"color":"#000000","size":"S","stock":5},{"color":"#000000","size":"M","stock":3},{"color":"#000000","size":"L","stock":2},{"color":"#0000FF","size":"S","stock":4},{"color":"#0000FF","size":"M","stock":6},{"color":"#0000FF","size":"L","stock":1}]', '["/product-2.png"]', 'Publish'),
        ('Hologram Hoodie', 'Holographic hoodie with interactive design', 'Hoodies', 179.99, '[{"color":"#000000","size":"S","stock":5},{"color":"#000000","size":"M","stock":3},{"color":"#000000","size":"L","stock":2},{"color":"#FF00FF","size":"S","stock":4},{"color":"#FF00FF","size":"M","stock":6},{"color":"#FF00FF","size":"L","stock":1}]', '["/product-3.png"]', 'Publish')
    `);
  }

  return db;
}