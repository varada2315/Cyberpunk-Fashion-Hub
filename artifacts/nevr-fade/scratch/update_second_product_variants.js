import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateProduct() {
  const dbPath = path.join(__dirname, '../database/nevrfade.db');
  console.log('Connecting to database at:', dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Let's get the second product
  const product = await db.get("SELECT * FROM products WHERE name LIKE '%Premium Plain%'");
  if (!product) {
    console.error("Premium Plain product not found!");
    await db.close();
    return;
  }

  console.log('Found product:', product.name, 'with ID:', product.id);

  // Both Black and Off-White variants
  const variants = [
    // Off White color variants
    { color: "#FAF9F6", size: "S", stock: 20 },
    { color: "#FAF9F6", size: "M", stock: 20 },
    { color: "#FAF9F6", size: "L", stock: 20 },
    { color: "#FAF9F6", size: "XL", stock: 20 },
    { color: "#FAF9F6", size: "XXL", stock: 20 },
    // Black color variants
    { color: "#000000", size: "S", stock: 20 },
    { color: "#000000", size: "M", stock: 20 },
    { color: "#000000", size: "L", stock: 20 },
    { color: "#000000", size: "XL", stock: 20 },
    { color: "#000000", size: "XXL", stock: 20 }
  ];

  // All images
  const images = [
    // Off-White variant
    "/IMG_1791.PNG",
    "/IMG_1794.PNG",
    "/IMG_1796.PNG",
    "/IMG_1797.PNG",
    "/IMG_1798.PNG",
    "/IMG_1811.PNG",
    "/IMG_1813.PNG",
    // Black variant
    "/IMG_1767.PNG",
    "/IMG_1770.PNG",
    "/IMG_1771.PNG",
    "/IMG_1804.PNG",
    "/IMG_1805.PNG",
    "/IMG_1809.PNG"
  ];

  const result = await db.run(
    'UPDATE products SET variants = ?, images = ? WHERE id = ?',
    [
      JSON.stringify(variants),
      JSON.stringify(images),
      product.id
    ]
  );
  console.log('Update result:', result);

  const updatedProduct = await db.get("SELECT * FROM products WHERE id = ?", [product.id]);
  console.log('Updated product images count:', JSON.parse(updatedProduct.images).length);
  console.log('Updated product variants count:', JSON.parse(updatedProduct.variants).length);

  await db.close();
}

updateProduct().catch(console.error);
