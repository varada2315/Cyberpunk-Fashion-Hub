import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function insertProduct() {
  const dbPath = path.join(__dirname, '../database/nevrfade.db');
  console.log('Connecting to database at:', dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const name = "Fearless Premium Boxy Fit Unisex T-Shirt | NEVRFADE";
  const description = `Crafted from 100% premium Terry Cotton fabric, the Fearless T-Shirt is designed for individuals who embrace confidence, ambition, and self-expression. Featuring a modern boxy fit and premium puff print detailing, this statement piece combines exceptional comfort with contemporary streetwear aesthetics.

The heavyweight Terry Cotton construction delivers a soft, breathable feel while maintaining a structured silhouette that sits perfectly on the body. Built for everyday wear, the Fearless Tee offers durability, comfort, and a premium look that stands out in any setting.

Product Details:
* 100% Premium Terry Cotton Fabric
* Premium Boxy Fit
* Premium High-Density Puff Print
* Soft, Breathable & Durable Material
* Unisex Design
* Ribbed Crew Neck
* Comfortable for All-Day Wear
* Streetwear-Inspired Premium Finish

Size & Fit:
* Model is wearing Size M
* Designed with a modern boxy silhouette
* For a relaxed fit, choose your regular size

Care Instructions:
* Machine Wash Cold
* Wash Inside Out
* Do Not Bleach
* Do Not Iron Directly on Print
* Hang Dry for Best Results

Fearless is more than a design—it's a mindset. Created for those who choose courage over comfort and confidence over doubt.

NEVRFADE — Built for the ones who never fade.`;

  const category = "T-Shirts";
  const price = 149.99;
  const sku = "TSHIRT-FEARLESS-BLK";
  
  const variants = [
    { color: "#000000", size: "S", stock: 20 },
    { color: "#000000", size: "M", stock: 20 },
    { color: "#000000", size: "L", stock: 20 },
    { color: "#000000", size: "XL", stock: 20 },
    { color: "#000000", size: "XXL", stock: 20 }
  ];

  const images = [
    "/IMG_1728.PNG",
    "/IMG_1745.PNG",
    "/IMG_1748.PNG",
    "/IMG_1749.PNG",
    "/IMG_1754.PNG",
    "/IMG_1755.PNG",
    "/IMG_1760.PNG",
    "/IMG_1764.PNG"
  ];

  const status = "Publish";

  console.log('Inserting product:', name);
  const result = await db.run(
    'INSERT INTO products (name, description, category, price, sku, variants, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      description,
      category,
      price,
      sku,
      JSON.stringify(variants),
      JSON.stringify(images),
      status
    ]
  );
  console.log('Insert result:', result);

  const count = await db.get('SELECT COUNT(*) as count FROM products');
  console.log('Current product count in database:', count.count);

  await db.close();
}

insertProduct().catch(console.error);
