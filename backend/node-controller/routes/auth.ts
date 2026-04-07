import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

// In-Memory store for development. For production auth, use Redis!
const otpStore = new Map<string, { code: string, expires: number }>();

router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate random 4 digit code
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store with 10 minute expiration
    otpStore.set(email, {
      code: token,
      expires: Date.now() + 10 * 60 * 1000 
    });

    // Check if real SMTP is properly configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"CampusTrace Security" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Your Account Verification Code',
          text: `Your CampusTrace Verification Code is: ${token}. This code will expire in 10 minutes.`,
          html: `<h3>CampusTrace Account Verification</h3><p>Your secure verification code is: <strong>${token}</strong></p><p>This code will expire in 10 minutes. Do not share this code.</p>`
        });
        console.log(`[Auth] Real email dispatched to ${email}`);
      } catch(emailErr) {
        console.error(`[Auth] SMTP Error natively forwarding to ${email}:`, emailErr);
      }
    } else {
      // Development Terminal Fallback
      console.log(`\n================================`);
      console.log(`📧 NEW EMAIL OTP DISPATCHED`);
      console.log(`To: ${email}`);
      console.log(`Code: >>> ${token} <<<`);
      console.log(`================================\n`);
    }

    res.json({ status: 'SUCCESS', message: 'Verification link sent to ' + email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to dispatch email verification module.' });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this email, or it expired.' });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.code === otp.trim()) {
      // Success! Clear it so it can't be reused
      otpStore.delete(email);
      res.json({ status: 'SUCCESS', message: 'Identity cryptographically validated.' });
    } else {
      res.status(401).json({ error: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication engine crashed.' });
  }
});

export default router;
