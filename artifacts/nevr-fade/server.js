import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { initDatabase } from './database/init.js';
dotenv.config();

// Debug: Log all environment variables
console.log('All environment variables:', process.env);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7826;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

// Middleware to parse JSON payloads (admin product image can be base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

const adminSessions = new Map();
const orders = [];

// Initialize database
let db;
initDatabase().then(database => {
  db = database;
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function getVariantKey(color, size) {
  return `${color}::${size}`;
}

function normalizeStockByVariant(stockByVariant, colors, sizes) {
  const rawStock =
    stockByVariant && typeof stockByVariant === 'object' && !Array.isArray(stockByVariant)
      ? stockByVariant
      : {};

  const normalized = {};

  colors.forEach((color) => {
    sizes.forEach((size) => {
      const key = getVariantKey(color, size);
      const qty = Number(rawStock[key]);
      normalized[key] = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0;
    });
  });

  return normalized;
}

function sanitizeProduct(payload) {
  const name = String(payload?.name || '').trim();
  const description = String(payload?.description || '').trim();
  const category = String(payload?.category || '').trim();
  const price = Number(payload?.price);
  const salePrice = payload?.salePrice !== undefined ? Number(payload?.salePrice) : null;
  const sku = String(payload?.sku || '').trim();
  const variants = Array.isArray(payload?.variants) ? payload.variants : [];
  const images = Array.isArray(payload?.images) ? payload.images : [];
  const status = String(payload?.status || 'Publish').trim();

  if (!name || !description || !category) {
    return { error: 'Name, description, and category are required.' };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: 'Price must be a number greater than zero.' };
  }

  if (variants.length === 0) {
    return { error: 'At least one variant is required.' };
  }

  // Validate that each variant has color, size, and stock
  for (const variant of variants) {
    if (!variant.color || !variant.size || variant.stock === undefined || variant.stock === null) {
      return { error: 'Each variant must have color, size, and stock.' };
    }
  }

  // Check that at least one variant has stock > 0
  const totalStock = variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
  if (totalStock <= 0) {
    return { error: 'At least one variant must have stock greater than zero.' };
  }

  return {
    product: {
      name,
      description,
      category,
      price,
      salePrice,
      sku,
      variants,
      images,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.adminToken = token;
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all products (public endpoint)
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a specific product by ID (public endpoint)
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get products with filtering (public endpoint)
app.get('/api/products/filter', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    let params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      if (params.length > 0) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(searchTerm, searchTerm);
      } else {
        query += ' WHERE (name LIKE ? OR description LIKE ?)';
        params.push(searchTerm, searchTerm);
      }
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const filtered = await db.all(query, params);
    res.json(filtered);
  } catch (err) {
    console.error('Error filtering products:', err);
    res.status(500).json({ error: 'Failed to filter products' });
  }
});

// Get product variants (public endpoint)
app.get('/api/products/:id/variants', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await db.get('SELECT variants FROM products WHERE id = ?', id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const variants = JSON.parse(product.variants);
    res.json(variants);
  } catch (err) {
    console.error('Error fetching product variants:', err);
    res.status(500).json({ error: 'Failed to fetch product variants' });
  }
});

// Admin endpoints
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  adminSessions.set(token, {
    createdAt: Date.now(),
    username
  });

  res.json({ token });
});

// Get all products for admin
app.get('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(products);
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create a new product (admin only)
app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const result = sanitizeProduct(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const product = result.product;
    
    // Convert variants to JSON string
    const variantsJson = JSON.stringify(product.variants);
    const imagesJson = JSON.stringify(product.images);
    
    const { id } = await db.run(
      'INSERT INTO products (name, description, category, price, salePrice, sku, variants, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      product.name,
      product.description,
      product.category,
      product.price,
      product.salePrice,
      product.sku,
      variantsJson,
      imagesJson,
      product.status
    );
    
    // Fetch the created product to return it
    const createdProduct = await db.get('SELECT * FROM products WHERE id = ?', id);
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product (admin only)
app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = sanitizeProduct(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const product = result.product;
    
    // Convert variants to JSON string
    const variantsJson = JSON.stringify(product.variants);
    const imagesJson = JSON.stringify(product.images);
    
    await db.run(
      'UPDATE products SET name = ?, description = ?, category = ?, price = ?, salePrice = ?, sku = ?, variants = ?, images = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      product.name,
      product.description,
      product.category,
      product.price,
      product.salePrice,
      product.sku,
      variantsJson,
      imagesJson,
      product.status,
      id
    );
    
    // Fetch the updated product to return it
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', id);
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product (admin only)
app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.run('DELETE FROM products WHERE id = ?', id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, removed: { id } });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get orders for admin
app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
  res.json(orders);
});

// Create Razorpay order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount provided'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: currency,
      receipt: receipt || `order_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      error: 'Failed to create Razorpay order'
    });
  }
});

// Process checkout
app.post('/api/checkout', async (req, res) => {
  const { items, name, email, address, city, zipCode, orderId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'At least one cart item is required.'
    });
  }

  if (!name || !email || !address || !city || !zipCode) {
    return res.status(400).json({
      error: 'Shipping information is required.'
    });
  }

  if (!orderId) {
    return res.status(400).json({
      error: 'Order ID is required.'
    });
  }

  // Validate that the order exists and matches the cart items
  const orderRecord = {
    id: orders.length + 1,
    orderId: `ORDER-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name,
    email,
    address,
    city,
    zipCode,
    items,
    amount: items.reduce((sum, item) => {
      const quantity = Number(item?.quantity || 0);
      const unitPrice = Number(item?.product?.price || 0);
      return sum + quantity * unitPrice;
    }, 0)
  };

  orders.push(orderRecord);

  console.log('Checkout request received', {
    orderId: orderRecord.orderId,
    itemCount: orderRecord.items.length,
    amount: orderRecord.amount
  });

  res.json({
    success: true,
    orderId: orderRecord.orderId,
    message: 'Order processed successfully'
  });
});

// Body parser / API error handling
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large. Please use a smaller image.'
    });
  }

  if (req.path.startsWith('/api/')) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  next(err);
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/public')));

// Catch-all handler that avoids problematic route patterns
app.use((req, res, next) => {
  // If it's an API request, let it pass through
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // For all other requests, serve the index.html
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`NevrFade server running on port ${PORT}`);
});
