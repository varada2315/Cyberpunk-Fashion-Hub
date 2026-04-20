import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  });

  try {
    const info = await transporter.sendMail({
      from: `"Never Fade" <${process.env.SMTP_USER}>`,
      to: "n4nikhilkana@gmail.com",
      subject: "SMTP Test (Port 587) - " + new Date().toLocaleTimeString(),
      text: "Testing delivery via Port 587 with STARTTLS."
    });
    console.log('SENT via 587: ' + info.messageId);
  } catch (error) {
    console.error('FAILED via 587: ', error.message);
  }
}

testEmail();
