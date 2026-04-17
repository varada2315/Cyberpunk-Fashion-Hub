import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { initDatabase } from './database/init.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7826;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Static files
app.use('/uploads', express.static(uploadsDir));

// Sessions
const adminSessions = new Map();

// Database
let db;
initDatabase().then(database => {
  db = database;
  console.log('Database initialized successfully');
}).catch(err => console.error('Failed to initialize database:', err));

// Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Email transporter
const transporterOptions = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: false,
};

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporterOptions.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  };
}

const transporter = nodemailer.createTransport(transporterOptions);

async function sendOrderEmail(email, name, orderId, status, amount, items) {
  const isPaid = status === 'paid';
  const subject = isPaid ? `Order Confirmation - ${orderId}` : `Payment Failed - ${orderId}`;
  
  // Parse items if they are string
  const itemsList = typeof items === 'string' ? JSON.parse(items) : items;
  
  const itemsHtml = itemsList.map(item => `
    <li style="margin-bottom: 10px;">
      <strong>${item.product.title || item.product.name}</strong> (x${item.quantity})<br>
      <span style="color: #666; font-size: 0.9em;">
        ${item.selectedColor ? `Color: ${item.selectedColor} ` : ''}
        ${item.selectedSize ? `Size: ${item.selectedSize}` : ''}
      </span>
    </li>
  `).join('');

  const mailOptions = {
    from: `"Never Fade" <${process.env.SMTP_USER || 'no-reply@nevrfade.com'}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0d0d0d; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; letter-spacing: 2px;">NEVER FADE</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6;">
          <h2 style="color: ${isPaid ? '#4CAF50' : '#f44336'}; margin-top: 0;">${isPaid ? 'Payment Successful!' : 'Payment Failed'}</h2>
          <p>Dear ${name},</p>
          <p>${isPaid ? 'Thank you for your purchase! Your payment was successful and your order is being processed.' : 'Unfortunately, your payment for order ' + orderId + ' failed. Please check your payment details and try again.'}</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${amount.toFixed(2)}</p>
            <h4 style="margin-bottom: 10px;">Items:</h4>
            <ul style="padding-left: 20px; margin: 0;">${itemsHtml}</ul>
          </div>
          
          <p>${isPaid ? 'We will notify you once your order has been shipped.' : 'If you need help, feel free to contact our support team.'}</p>
          <p>Stay Cyber,</p>
          <p><strong>The Never Fade Team</strong></p>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 0.8em; color: #777;">
          <p>© ${new Date().getFullYear()} Cyberpunk Fashion Hub - Never Fade. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const isLocal = process.env.SMTP_HOST === 'localhost' || process.env.SMTP_HOST === '127.0.0.1';
    if (!isLocal && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
      console.warn('SMTP credentials not configured. Email not sent, but logging details:');
      console.log('Recipient:', email);
      console.log('Subject:', subject);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for order ${orderId}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

// Helpers
function transformProduct(row) {
  if (!row) return null;
  const product = { ...row };
  try { product.variants = typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants; } catch (e) { product.variants = []; }
  try { product.images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images; } catch (e) { product.images = []; }
  
  product.title = row.name;
  product.image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
  
  if (Array.isArray(product.variants)) {
    const colors = new Set();
    const sizes = new Set();
    const stockByVariant = {};
    product.variants.forEach(v => {
      if (v.color) colors.add(v.color);
      if (v.size) sizes.add(v.size);
      if (v.color && v.size) stockByVariant[v.color + '::' + v.size] = v.stock;
    });
    product.colors = Array.from(colors);
    product.sizes = Array.from(sizes);
    product.stockByVariant = stockByVariant;
  }
  return product;
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.adminToken = token;
  next();
}

// Routes
app.get('/api/products', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  try {
    const rows = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(rows.map(transformProduct));
  } catch (err) { res.status(500).json({ error: 'Error fetching products' }); }
});

app.get('/api/products/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  try {
    const row = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(transformProduct(row));
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/upload', requireAdminAuth, (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });
  try {
    const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Invalid format' });
    const ext = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const filename = `img_${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), data);
    res.json({ url: `/uploads/${filename}` });
  } catch (err) { res.status(500).json({ error: 'Upload failed' }); }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid creds' });
  const token = crypto.randomBytes(24).toString('hex');
  adminSessions.set(token, { createdAt: Date.now(), username });
  res.json({ token });
});

app.get('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(rows.map(transformProduct));
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  const { title, name, description, category, price, variants, images, status } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO products (name, description, category, price, variants, images, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      title || name, description, category, price, JSON.stringify(variants || []), JSON.stringify(images || []), status || 'Publish'
    );
    const created = await db.get('SELECT * FROM products WHERE id = ?', result.lastID);
    res.status(201).json(transformProduct(created));
  } catch (err) { 
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Create failed' }); 
  }
});

app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  const { title, name, description, category, price, variants, images, status } = req.body;
  try {
    await db.run(
      'UPDATE products SET name = ?, description = ?, category = ?, price = ?, variants = ?, images = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      title || name, description, category, price, JSON.stringify(variants || []), JSON.stringify(images || []), status || 'Publish', req.params.id
    );
    const updated = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    res.json(transformProduct(updated));
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    await db.run('DELETE FROM products WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.get('/api/admin/orders', requireAdminAuth, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM orders ORDER BY createdAt DESC');
    res.json(rows.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })));
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/create-order', async (req, res) => {
  const { amount, receipt } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: receipt || `order_${Date.now()}`
    });
    res.json({ success: true, order });
  } catch (e) { 
    console.error('Razorpay order creation failed:', e);
    res.status(500).json({ error: e.message || 'Failed' }); 
  }
});

app.post('/api/checkout', async (req, res) => {
  const { items, name, email, address, city, state, zipCode, orderId } = req.body;
  const total = items.reduce((s, i) => s + (i.product.price * i.quantity), 0) * 1.08;
  try {
    await db.run(
      'INSERT INTO orders (orderId, name, email, address, city, zipCode, items, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      orderId, name, email, `${address}, ${state||''}`, city, zipCode, JSON.stringify(items), total
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Checkout failed' }); }
});

app.post('/api/razorpay-webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'nevrfade_secret_123';
  const signature = req.headers['x-razorpay-signature'];
  
  try {
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (signature === digest) {
      console.log('Razorpay Webhook Verified:', req.body.event);
      
      const event = req.body.event;
      if (event === 'order.paid' || event === 'payment.captured') {
        const payment = req.body.payload.payment.entity;
        const orderId = payment.order_id;
        console.log(`Payment successful for order: ${orderId}`);
        
        // Fetch order details from DB to send email
        db.get('SELECT * FROM orders WHERE orderId = ?', orderId).then(order => {
          if (order) {
            sendOrderEmail(order.email, order.name, order.orderId, 'paid', order.amount, order.items);
            // Update order status in DB if column exists (optional but recommended)
            db.run('UPDATE orders SET status = ? WHERE orderId = ?', 'paid', orderId).catch(() => {});
          }
        });
      } else if (event === 'payment.failed') {
        const payment = req.body.payload.payment.entity;
        const orderId = payment.order_id;
        console.warn(`Payment failed for order: ${orderId}. Error: ${payment.error_description}`);
        
        // Fetch order details from DB to send failure email
        db.get('SELECT * FROM orders WHERE orderId = ?', orderId).then(order => {
          if (order) {
            sendOrderEmail(order.email, order.name, order.orderId, 'failed', order.amount, order.items);
            db.run('UPDATE orders SET status = ? WHERE orderId = ?', 'failed', orderId).catch(() => {});
          }
        });
      }
      
      res.status(200).json({ status: 'ok' });
    } else {
      console.warn('Razorpay Webhook Signature Mismatch');
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.use(express.static(path.join(__dirname, 'dist/public')));
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => console.log(`NevrFade server on ${PORT}`));
