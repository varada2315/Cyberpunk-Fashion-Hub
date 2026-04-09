import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

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

const products = [
  {
    id: 1,
    title: 'Cyber Jacket',
    description: 'Premium cyberpunk jacket with neon accents',
    price: 199.99,
    category: 'Jackets',
    image: '/product-1.png',
    colors: ['#000000', '#FF0000', '#00FF00'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stockByVariant: {}
  },
  {
    id: 2,
    title: 'Neon Pants',
    description: 'Stylish neon pants for the urban explorer',
    price: 129.99,
    category: 'Pants',
    image: '/product-2.png',
    colors: ['#000000', '#0000FF', '#FFFF00'],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: {}
  },
  {
    id: 3,
    title: 'Hologram Hoodie',
    description: 'Holographic hoodie with interactive design',
    price: 179.99,
    category: 'Hoodies',
    image: '/product-3.png',
    colors: ['#000000', '#FF00FF', '#00FFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    stockByVariant: {}
  }
];

products.forEach((product) => {
  product.stockByVariant = normalizeStockByVariant(product.stockByVariant, product.colors, product.sizes);
});

function sanitizeProduct(payload) {
  const title = String(payload?.title || '').trim();
  const description = String(payload?.description || '').trim();
  const category = String(payload?.category || '').trim();
  const image = String(payload?.image || '').trim();
  const price = Number(payload?.price);
  const colors = Array.isArray(payload?.colors)
    ? payload.colors.map((color) => String(color).trim()).filter(Boolean)
    : [];
  const sizes = Array.isArray(payload?.sizes)
    ? payload.sizes.map((size) => String(size).trim()).filter(Boolean)
    : [];
  const stockByVariant = normalizeStockByVariant(payload?.stockByVariant, colors, sizes);

  if (!title || !description || !category || !image) {
    return { error: 'Title, description, category, and image are required.' };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: 'Price must be a number greater than zero.' };
  }

  return {
    product: {
      title,
      description,
      category,
      image,
      price,
      colors,
      sizes,
      stockByVariant
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

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

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

app.get('/api/admin/products', requireAdminAuth, (req, res) => {
  res.json(products);
});

app.post('/api/admin/products', requireAdminAuth, (req, res) => {
  const result = sanitizeProduct(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const created = {
    id: nextId,
    ...result.product
  };

  products.push(created);
  res.status(201).json(created);
});

app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const result = sanitizeProduct(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const updated = {
    id,
    ...result.product
  };

  products[index] = updated;
  res.json(updated);
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const [removed] = products.splice(index, 1);
  res.json({ success: true, removed });
});

app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
  res.json(orders);
});

app.post('/api/checkout', (req, res) => {
  const { items, name, email, address, city, zipCode, cardNumber, expiry, cvv } = req.body;

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

  if (!cardNumber || !expiry || !cvv) {
    return res.status(400).json({
      error: 'Payment information is required.'
    });
  }

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
