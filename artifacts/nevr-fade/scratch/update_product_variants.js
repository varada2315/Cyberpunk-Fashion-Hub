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

  // Let's get the Fearless T-Shirt product
  const product = await db.get("SELECT * FROM products WHERE name LIKE '%Fearless%'");
  if (!product) {
    console.error("Fearless product not found!");
    await db.close();
    return;
  }

  console.log('Found product:', product.name, 'with ID:', product.id);

  // Black and Off-White variants
  const variants = [
    // Black color variants
    { color: "#000000", size: "S", stock: 20 },
    { color: "#000000", size: "M", stock: 20 },
    { color: "#000000", size: "L", stock: 20 },
    { color: "#000000", size: "XL", stock: 20 },
    { color: "#000000", size: "XXL", stock: 20 },
    // Off White color variants
    { color: "#FAF9F6", size: "S", stock: 20 },
    { color: "#FAF9F6", size: "M", stock: 20 },
    { color: "#FAF9F6", size: "L", stock: 20 },
    { color: "#FAF9F6", size: "XL", stock: 20 },
    { color: "#FAF9F6", size: "XXL", stock: 20 }
  ];

  // All images
  const images = [
    // Black variant
    "/IMG_1728.PNG",
    "/IMG_1745.PNG",
    "/IMG_1748.PNG",
    "/IMG_1749.PNG",
    "/IMG_1754.PNG",
    "/IMG_1755.PNG",
    "/IMG_1760.PNG",
    "/IMG_1764.PNG",
    // Off-White variant
    "/IMG_1730.PNG",
    "/IMG_1732 (1).PNG",
    "/IMG_1733.PNG",
    "/IMG_1738.PNG",
    "/IMG_1742.PNG",
    "/IMG_1753.PNG"
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
