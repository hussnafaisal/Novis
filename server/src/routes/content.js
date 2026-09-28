import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/journal', async (req, res, next) => {
  try {
    res.json({ posts: await prisma.journalPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } }) });
  } catch (error) {
    next(error);
  }
});

r.post('/newsletter', async (req, res, next) => {
  try {
    const email = z.email('Please enter a valid email address.').parse(req.body.email);
    await prisma.newsletterSubscriber.upsert({ where: { email }, create: { email }, update: { active: true } });
    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (error) {
    next(error);
  }
});

r.post('/contact', async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
      email: z.email('Please enter a valid email address.'),
      subject: z.string().trim().min(2, 'Please enter a subject.'),
      message: z.string().trim().min(5, 'Message must be at least 5 characters.'),
    }).parse(req.body);

    await prisma.contactMessage.create({ data });
    res.status(201).json({ message: 'Message received successfully.' });
  } catch (error) {
    next(error);
  }
});

r.get('/my-messages', requireAuth, async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      where: { email: req.user.email },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

export default r;
