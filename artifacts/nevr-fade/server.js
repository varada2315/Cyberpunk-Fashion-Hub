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
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'NevrfadeClothing@gmail.com';

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
const otpStore = new Map();

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
  secure: parseInt(process.env.SMTP_PORT) === 465,
};

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporterOptions.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  };
}

const transporter = nodemailer.createTransport(transporterOptions);

async function sendOrderEmail(order, paymentStatus) {
  const { email, name, orderId, amount, items, phone, address, city, state, zipCode, country } = order;
  const isPaid = paymentStatus === 'paid';
  const subject = isPaid ? `Your Order #${orderId} has been confirmed!` : `Payment required for your order #${orderId}`;
  
  // Parse items if they are string
  const itemsList = typeof items === 'string' ? JSON.parse(items) : items;
  
  const itemsHtml = itemsList.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
        <div style="font-weight: bold; color: #333333; font-size: 16px;">${item.product.title || item.product.name}</div>
        <div style="color: #666666; font-size: 14px; margin-top: 4px;">
          ${item.selectedColor ? `Color: ${item.selectedColor}` : ''} ${item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
        </div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee; text-align: center; color: #333333;">x${item.quantity}</td>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #333333;">₹${(item.product.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Never Fade" <${process.env.SMTP_USER || 'no-replay@nevrfade.in'}>`,
    to: email,
    bcc: ADMIN_EMAIL,
    subject: subject,
    attachments: [{
      filename: 'logo.png',
      path: path.join(__dirname, 'public/NEVR FADE logo design.png'),
      cid: 'nevrfadelogo'
    }],
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 0; background-color: #ffffff; border-bottom: 1px solid #f0f0f0;">
                    <img src="cid:nevrfadelogo" alt="NEVR FADE" width="200" style="display: block; border: 0;">
                  </td>
                </tr>
                
                <!-- Hero Section -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background-color: ${isPaid ? '#e6f7ed' : '#fff0f0'}; display: table-cell; vertical-align: middle;">
                      <span style="font-size: 30px; color: ${isPaid ? '#28a745' : '#dc3545'}; line-height: 60px;">${isPaid ? '✓' : '!'}</span>
                    </div>
                    <h1 style="margin: 20px 0 10px 0; font-size: 24px; color: #1a1a1a;">${isPaid ? 'Order Confirmed!' : 'Action Required'}</h1>
                    <p style="margin: 0; color: #666666; font-size: 16px;">Order ID: <strong>#${orderId}</strong></p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px 40px 40px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #444444;">
                      Hi ${name},<br><br>
                      ${isPaid 
                        ? "Thank you for shopping with NEVR FADE. Your order has been confirmed and is now being prepared for shipping. We'll send you a notification as soon as it's on its way." 
                        : "There was an issue processing your payment. Please use the link below to complete your order and secure your items."}
                    </p>

                    <!-- Order Summary -->
                    <h3 style="margin: 40px 0 15px 0; font-size: 18px; border-bottom: 2px solid #333333; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <thead>
                        <tr>
                          <th align="left" style="color: #888888; font-size: 12px; text-transform: uppercase;">Product</th>
                          <th align="center" style="color: #888888; font-size: 12px; text-transform: uppercase;">Qty</th>
                          <th align="right" style="color: #888888; font-size: 12px; text-transform: uppercase;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 20px 0 5px 0; text-align: right; color: #666666;">Subtotal</td>
                          <td style="padding: 20px 0 5px 0; text-align: right; color: #333333;">₹${(amount / 1.08).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 5px 0 5px 0; text-align: right; color: #666666;">Tax (8%)</td>
                          <td style="padding: 5px 0 5px 0; text-align: right; color: #333333;">₹${(amount - (amount / 1.08)).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-size: 18px; color: #333333;">Total Paid</td>
                          <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-size: 24px; color: #000000;">₹${amount.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <!-- Delivery Info -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; background-color: #fafafa; border-radius: 4px; border: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px; color: #888888;">Delivery Address</h4>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #333333;">
                            <strong>${name}</strong><br>
                            ${address}<br>
                            ${city}, ${state} ${zipCode}<br>
                            ${country}<br>
                            Phone: ${phone || 'N/A'}
                          </p>
                        </td>
                      </tr>
                    </table>

                    ${isPaid ? `
                    <div style="margin-top: 30px; padding: 20px; border: 1px dashed #28a745; background-color: #f6fff8; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 15px 0; font-size: 14px; color: #333333;">Need help or have questions about your order?</p>
                      <a href="https://wa.me/919103586486?text=${encodeURIComponent(`Hi, I have an inquiry regarding my order #${orderId}`)}" style="background-color: #25D366; color: #ffffff; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px;">
                        Connect with Vendor on WhatsApp
                      </a>
                    </div>
                    ` : `
                    <div style="margin-top: 30px; text-align: center;">
                      <a href="#" style="background-color: #000000; color: #ffffff; padding: 15px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">Complete Payment</a>
                    </div>`}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 40px; background-color: #1a1a1a; color: #888888; font-size: 12px; line-height: 1.5;">
                    <p style="margin: 0 0 10px 0; color: #ffffff; font-weight: bold;">NEVR FADE</p>
                    <p style="margin: 0 0 20px 0;">Cyberpunk Fashion for the New Age.</p>
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Never Fade. All rights reserved.</p>
                    <p style="margin: 10px 0 0 0;">You received this because you made a purchase on nevrfade.in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
    console.log(`Order confirmation email sent to ${email} for order ${orderId}`);
  } catch (error) {
    console.error(`Failed to send order email to ${email}:`, error);
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
    if (!matches) {
      console.error('Invalid image format received');
      return res.status(400).json({ error: 'Invalid format' });
    }
    const ext = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const filename = `img_${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), data);
    console.log(`Successfully uploaded image: ${filename} (${data.length} bytes)`);
    res.json({ url: `/uploads/${filename}` });
  } catch (err) { 
    console.error('Upload failed with error:', err);
    res.status(500).json({ error: 'Upload failed' }); 
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid creds' });
  const token = crypto.randomBytes(24).toString('hex');
  adminSessions.set(token, { createdAt: Date.now(), username });
  res.json({ token });
});

app.post('/api/admin/request-otp', requireAdminAuth, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[AUTH] Generated Admin Password Change OTP: ${otp}`);
  otpStore.set(req.adminToken, {
    otp,
    newPassword,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  const mailOptions = {
    from: `"Never Fade Admin" <${process.env.SMTP_USER || 'no-replay@nevrfade.in'}>`,
    to: ADMIN_EMAIL,
    subject: 'Admin Password Change OTP',
    html: `
      <h2>Admin Password Change Request</h2>
      <p>An attempt was made to change the admin password for NevrFade dashboard.</p>
      <p>Your OTP verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    `
  };

  try {
    const isLocal = process.env.SMTP_HOST === 'localhost' || process.env.SMTP_HOST === '127.0.0.1';
    if (!isLocal && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
      console.log('Sending mock OTP (No SMTP credentials):', otp);
      return res.json({ success: true, message: 'OTP sent (mock)' });
    }
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

app.post('/api/admin/change-password', requireAdminAuth, async (req, res) => {
  const { otp } = req.body;
  const sessionData = otpStore.get(req.adminToken);
  
  if (!sessionData) return res.status(400).json({ error: 'No active password change request' });
  if (Date.now() > sessionData.expiresAt) {
    otpStore.delete(req.adminToken);
    return res.status(400).json({ error: 'OTP has expired' });
  }
  if (sessionData.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  
  // Valid OTP! Change password.
  try {
    ADMIN_PASSWORD = sessionData.newPassword;
    console.log('[AUTH] OTP entered correctly. Password changed successfully.');
    otpStore.delete(req.adminToken);
    
    // Attempt to update .env to ensure persistence
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      const adminPassRegex = /^ADMIN_PASSWORD=.*$/m;
      if (adminPassRegex.test(envContent)) {
        envContent = envContent.replace(adminPassRegex, `ADMIN_PASSWORD=${ADMIN_PASSWORD}`);
      } else {
        envContent += `\nADMIN_PASSWORD=${ADMIN_PASSWORD}\n`;
      }
    } else {
      envContent = `ADMIN_PASSWORD=${ADMIN_PASSWORD}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Failed to write new password to .env:', error);
    res.status(500).json({ error: 'Failed to write new password to environmental variables' });
  }
});

// Unauthenticated forgot password routes
app.post('/api/admin/forgot-password-request-otp', async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[AUTH] Generated Forgot Password OTP: ${otp}`);
  otpStore.set('forgot_password', {
    otp,
    newPassword,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  const mailOptions = {
    from: `"Never Fade Admin" <${process.env.SMTP_USER || 'no-replay@nevrfade.in'}>`,
    to: ADMIN_EMAIL,
    subject: 'Admin Password Reset OTP',
    html: `
      <h2>Admin Password Reset Request</h2>
      <p>Someone (hopefully you) requested to reset the admin password from the login screen.</p>
      <p>Your OTP verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    `
  };

  try {
    const isLocal = process.env.SMTP_HOST === 'localhost' || process.env.SMTP_HOST === '127.0.0.1';
    if (!isLocal && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
      console.log('Sending mock OTP (No SMTP credentials):', otp);
      return res.json({ success: true, message: 'OTP sent (mock)' });
    }
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

app.post('/api/admin/forgot-password-change-password', async (req, res) => {
  const { otp } = req.body;
  const sessionData = otpStore.get('forgot_password');
  
  if (!sessionData) return res.status(400).json({ error: 'No active password reset request' });
  if (Date.now() > sessionData.expiresAt) {
    otpStore.delete('forgot_password');
    return res.status(400).json({ error: 'OTP has expired' });
  }
  if (sessionData.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  
  try {
    ADMIN_PASSWORD = sessionData.newPassword;
    console.log('[AUTH] OTP entered correctly via Forgot Password. Password changed successfully.');
    otpStore.delete('forgot_password');
    
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      const adminPassRegex = /^ADMIN_PASSWORD=.*$/m;
      if (adminPassRegex.test(envContent)) {
        envContent = envContent.replace(adminPassRegex, `ADMIN_PASSWORD=${ADMIN_PASSWORD}`);
      } else {
        envContent += `\nADMIN_PASSWORD=${ADMIN_PASSWORD}\n`;
      }
    } else {
      envContent = `ADMIN_PASSWORD=${ADMIN_PASSWORD}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Failed to write new password to .env:', error);
    res.json({ success: true, message: 'Password changed successfully (in-memory only)' });
  }
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
  const { items, name, email, address, city, state, zipCode, country, phone, orderId } = req.body;
  const total = items.reduce((s, i) => s + (i.product.price * i.quantity), 0) * 1.08;
  try {
    await db.run(
      'INSERT INTO orders (orderId, name, email, phone, address, city, state, zipCode, country, items, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      orderId, name, email, phone, address, city, state, zipCode, country || 'India', JSON.stringify(items), total
    );
    res.json({ success: true });
  } catch (e) { 
    console.error('Checkout error:', e);
    res.status(500).json({ error: 'Checkout failed' }); 
  }
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
            sendOrderEmail(order, 'paid');
            // Update order status in DB
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
            sendOrderEmail(order, 'failed');
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
