import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import auth from './routes/auth.js';
import products from './routes/products.js';
import cart from './routes/cart.js';
import orders from './routes/orders.js';
import wishlist from './routes/wishlist.js';
import content from './routes/content.js';
import admin from './routes/admin.js';
import payments from './routes/payments.js';

import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'NOVIS API',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/orders', orders);
app.use('/api/wishlist', wishlist);
app.use('/api/content', content);
app.use('/api/admin', admin);
app.use('/api/payments', payments);

app.use(notFound);
app.use(errorHandler);

export default app;