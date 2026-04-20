import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyFlow() {
  console.log('--- Order Flow Verification ---');
  
  // 1. Initialize DB and add columns
  console.log('Initializing database...');
  const db = await open({
    filename: path.join(__dirname, '../database/nevrfade.db'),
    driver: sqlite3.Database
  });

  // Mock the DB update logic from init.js
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      zipCode TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      items TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = await db.all("PRAGMA table_info(orders)");
  const columnNames = columns.map(c => c.name);
  if (!columnNames.includes('phone')) await db.exec('ALTER TABLE orders ADD COLUMN phone TEXT');
  if (!columnNames.includes('state')) await db.exec('ALTER TABLE orders ADD COLUMN state TEXT');
  if (!columnNames.includes('country')) await db.exec('ALTER TABLE orders ADD COLUMN country TEXT DEFAULT "India"');

  console.log('Database schema verified.');

  // 2. Prepare mock order
  const mockOrder = {
    orderId: 'order_test_' + Date.now(),
    name: 'Test Customer',
    email: 'n4nikhilkana@gmail.com', // Using user's test email
    phone: '+91 98765 43210',
    address: 'Sector 4, Cyber City',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India',
    amount: 199.99,
    items: JSON.stringify([
      {
        product: { title: 'Cyber Jacket', price: 199.99 },
        quantity: 1,
        selectedColor: 'Neon Red',
        selectedSize: 'L'
      }
    ])
  };

  console.log('Inserting mock order...');
  await db.run(
    'INSERT INTO orders (orderId, name, email, phone, address, city, state, zipCode, country, items, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    mockOrder.orderId, mockOrder.name, mockOrder.email, mockOrder.phone, mockOrder.address, mockOrder.city, mockOrder.state, mockOrder.zipCode, mockOrder.country, mockOrder.items, mockOrder.amount
  );

  // 3. Test Email Sending
  console.log('Simulating sendOrderEmail...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Simplified version of the new template for the verification script
  const itemsList = JSON.parse(mockOrder.items);
  const itemsHtml = itemsList.map(item => `
    <div style="display: flex; align-items: center; border-bottom: 1px solid #333; padding: 15px 0;">
      <div style="flex: 1;">
        <h4 style="margin: 0; color: #fff; font-size: 16px;">${item.product.title}</h4>
        <p style="margin: 5px 0 0; color: #aaaaaa; font-size: 14px;">
          Quantity: ${item.quantity} | Color: ${item.selectedColor} | Size: ${item.selectedSize}
        </p>
      </div>
      <div style="text-align: right; color: #fff; font-weight: bold;">
        ₹${(item.product.price * item.quantity).toFixed(2)}
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from: `"Never Fade" <${process.env.SMTP_USER}>`,
    to: mockOrder.email,
    subject: `Order Confirmation Verification - ${mockOrder.orderId}`,
    html: `
      <div style="background-color: #0d0d0d; color: #e0e0e0; padding: 40px; font-family: sans-serif;">
        <h1 style="color: #fff;">NEVER FADE</h1>
        <p>Hi ${mockOrder.name}, your verification order has been triggered.</p>
        <div>${itemsHtml}</div>
        <p><strong>Shipping To:</strong><br>${mockOrder.address}, ${mockOrder.city}, ${mockOrder.state} ${mockOrder.zipCode}</p>
        <p><strong>Phone:</strong> ${mockOrder.phone}</p>
        <p><strong>Total:</strong> ₹${mockOrder.amount.toFixed(2)}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('SUCCESS: Verification email sent.');
  } catch (error) {
    console.error('FAILED: Verification email error:', error);
  }

  await db.close();
  console.log('--- Verification Complete ---');
}

verifyFlow();
