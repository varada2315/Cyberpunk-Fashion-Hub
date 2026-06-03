import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updatePrices() {
  const dbPath = path.join(__dirname, '../database/nevrfade.db');
  console.log('Connecting to database at:', dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Update first product pricing (Fearless)
  const result1 = await db.run(
    "UPDATE products SET price = 599 WHERE name LIKE '%Fearless%'"
  );
  console.log('First product price update result:', result1);

  // Update second product pricing (Premium Plain)
  const result2 = await db.run(
    "UPDATE products SET price = 499 WHERE name LIKE '%Premium Plain%'"
  );
  console.log('Second product price update result:', result2);

  // Verify updates
  const products = await db.all("SELECT id, name, price FROM products");
  console.log('Updated products list:');
  console.log(products);

  await db.close();
}

updatePrices().catch(console.error);
