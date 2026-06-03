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

  const name = "Premium Plain Unisex Boxy Fit T-Shirt | NEVRFADE";
  const description = `Elevate your everyday essentials with the Premium Plain Unisex T-Shirt, crafted from a premium blend of 80% Cotton and 20% Lycra for the perfect combination of softness, stretch, and durability. Designed with a clean, minimalist aesthetic and a modern boxy fit, this versatile wardrobe staple delivers exceptional comfort and effortless style for any occasion.

The cotton-rich fabric ensures breathability and all-day comfort, while the Lycra blend provides enhanced flexibility, shape retention, and a smooth premium finish. Whether worn on its own or layered, this plain tee is built to offer a structured silhouette, refined look, and lasting quality.

Product Details:
* 80% Premium Cotton, 20% Lycra Blend
* Modern Boxy Fit
* Soft, Stretchable & Breathable Fabric
* Premium Plain Design
* Excellent Shape Retention
* Lightweight & Durable Construction
* Unisex Design
* Suitable for Everyday Wear

Size & Fit:
* Model is wearing Size M
* Designed with a modern boxy silhouette
* Choose your regular size for the intended fit

Care Instructions:
* Machine Wash Cold
* Wash with Similar Colors
* Do Not Bleach
* Tumble Dry Low or Hang Dry
* Warm Iron if Needed

Timeless, versatile, and built for everyday confidence, this premium plain tee is designed to be the foundation of every modern wardrobe.

NEVRFADE — Simplicity Never Goes Out of Style.`;

  const category = "T-Shirts";
  const price = 149.99;
  const sku = "TSHIRT-PLAIN-OWH";
  
  const variants = [
    { color: "#FAF9F6", size: "S", stock: 20 },
    { color: "#FAF9F6", size: "M", stock: 20 },
    { color: "#FAF9F6", size: "L", stock: 20 },
    { color: "#FAF9F6", size: "XL", stock: 20 },
    { color: "#FAF9F6", size: "XXL", stock: 20 }
  ];

  const images = [
    "/IMG_1791.PNG",
    "/IMG_1794.PNG",
    "/IMG_1796.PNG",
    "/IMG_1797.PNG",
    "/IMG_1798.PNG",
    "/IMG_1811.PNG",
    "/IMG_1813.PNG"
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
