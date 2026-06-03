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
      phone TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      zipCode TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      items TEXT NOT NULL, -- JSON string of items
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add missing columns to orders table if they don't exist (for existing databases)
  const columns = await db.all("PRAGMA table_info(orders)");
  const columnNames = columns.map(c => c.name);
  
  if (!columnNames.includes('phone')) {
    await db.exec('ALTER TABLE orders ADD COLUMN phone TEXT');
  }
  if (!columnNames.includes('state')) {
    await db.exec('ALTER TABLE orders ADD COLUMN state TEXT');
  }
  if (!columnNames.includes('country')) {
    await db.exec('ALTER TABLE orders ADD COLUMN country TEXT DEFAULT "India"');
  }



  return db;
}