import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function clearProducts() {
  const dbPath = path.join(__dirname, '../database/nevrfade.db');
  console.log('Connecting to database at:', dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Deleting all products...');
  const result = await db.run('DELETE FROM products');
  console.log('Delete result:', result);

  const count = await db.get('SELECT COUNT(*) as count FROM products');
  console.log('Current product count in database:', count.count);

  await db.close();
}

clearProducts().catch(console.error);
