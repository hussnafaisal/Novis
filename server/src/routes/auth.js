import { Router } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, signToken } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
const safe = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, createdAt: u.createdAt });
const mailer = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

async function sendResetCode(user, code) {
  if (!mailer) {
    console.log(`NOVIS password reset code for ${user.email}: ${code}`);
    return false;
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'NOVIS verification code',
    text: `Hello ${user.name},\n\nYour NOVIS password reset verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`,
  });
  return true;
}

r.post('/register', async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().trim().min(2, 'Please enter your full name.'),
      email: z.email('Please enter a valid email address.'),
      password: z.string().min(8, 'Password must be at least 8 characters.'),
      phone: z.string().optional(),
    }).parse(req.body);

    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'This email is already registered. Please sign in instead.' });

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        passwordHash: await hashPassword(data.password),
        phone: data.phone,
      },
    });

    res.status(201).json({ user: safe(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

r.post('/login', async (req, res, next) => {
  try {
    const data = z.object({
      email: z.email('Please enter a valid email address.'),
      password: z.string().min(1, 'Please enter your password.'),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    res.json({ user: safe(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

r.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.email('Please enter a valid email address.') }).parse(req.body);
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.json({ exists: false, message: 'No NOVIS account was found with this email.' });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailed = await sendResetCode(user, code);
    res.json({
      exists: true,
      requiresCode: true,
      message: emailed ? 'A new verification code has been sent to your email.' : 'Verification code generated for local development.',
      ...(process.env.NODE_ENV !== 'production' && !mailer ? { devCode: code } : {}),
    });
  } catch (error) {
    next(error);
  }
});

r.post('/reset-password', async (req, res, next) => {
  try {
    const data = z.object({
      email: z.email().optional(),
      code: z.string().regex(/^\d{6}$/).optional(),
      token: z.string().min(20).optional(),
      password: z.string().min(8, 'Password must be at least 8 characters.'),
    }).refine((value) => Boolean(value.code || value.token), {
      message: 'A verification code is required.',
    }).parse(req.body);

    const tokenHash = data.code
      ? crypto.createHash('sha256').update(data.code).digest('hex')
      : crypto.createHash('sha256').update(data.token).digest('hex');

    const reset = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
        ...(data.email ? { user: { email: data.email.toLowerCase() } } : {}),
      },
    });

    if (!reset) return res.status(400).json({ message: 'The verification code is invalid or expired. Please request a new code.' });

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(data.password) } }),
      prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: reset.userId, id: { not: reset.id } } }),
    ]);

    res.json({ message: 'Password updated successfully. Your old password is no longer valid.' });
  } catch (error) {
    next(error);
  }
});

r.post('/logout', (req, res) => res.json({ message: 'Logged out' }));
r.get('/me', requireAuth, (req, res) => res.json({ user: safe(req.user) }));

export default r;
