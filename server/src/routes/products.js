import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const r = Router();
const map = (product) => ({
  ...product,
  price: Number(product.price),
  compareAt: product.compareAt == null ? null : Number(product.compareAt),
  features: product.features || [],
  images: product.images || [],
  image: (product.images || [])[0] || null,
});

const imageUrl = z.string().trim().url('Please provide a valid image URL.').refine((value) => /^https?:\/\//i.test(value), 'Image URL must start with http:// or https://.');
const schema = z.object({
  id: z.string().min(2),
  name: z.string().trim().min(2, 'Product name is required.'),
  slug: z.string().trim().min(2, 'Product slug is required.'),
  type: z.string().trim().min(2, 'Product type is required.'),
  size: z.string().trim().min(2, 'Product size is required.'),
  price: z.coerce.number().nonnegative('Price cannot be negative.'),
  compareAt: z.coerce.number().nonnegative().optional(),
  category: z.string().trim().min(2, 'Please select a category.'),
  brand: z.string().trim().optional(),
  description: z.string().trim().min(5, 'Product description is required.'),
  features: z.array(z.string()),
  images: z.array(imageUrl).min(1, 'Please add an image URL.'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative.'),
  active: z.boolean().optional(),
});

r.get('/', async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const where = {
      active: true,
      ...(category && category !== 'all' ? { category } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { type: { contains: q } }] } : {}),
    };
    const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ products: products.map(map) });
  } catch (error) {
    next(error);
  }
});

r.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], active: true } });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product: map(product) });
  } catch (error) {
    next(error);
  }
});

r.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: schema.parse(req.body) });
    res.status(201).json({ product: map(product) });
  } catch (error) {
    next(error);
  }
});

r.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: schema.omit({ id: true }).partial().parse(req.body) });
    res.json({ product: map(product) });
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ message: 'Product archived successfully.' });
  } catch (error) {
    next(error);
  }
});

export default r;
