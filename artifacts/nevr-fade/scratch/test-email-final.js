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
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    debug: true,
    logger: true
  });

  try {
    const info = await transporter.sendMail({
      from: `"Never Fade" <${process.env.SMTP_USER}>`,
      to: "n4nikhilkana@gmail.com",
      subject: "Final SMTP Test - " + new Date().toLocaleTimeString(),
      text: "Testing SMTP configuration again. If not received, please check SPF record."
    });
    console.log('SENT: ' + info.messageId);
    console.log('Server response: ' + info.response);
  } catch (error) {
    console.error('FAILED: ', error);
  }
}

testEmail();
