import express from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

router.get('/', apiLimiter, async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const type = String(req.query.type ?? 'all');
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = 10;
  const skip = (page - 1) * limit;

  let hasMore = false;
  const results: any = { users: [], posts: [], tags: [], web: [], images: [], videos: [] };

  if (!q) {
    return res.json({ results, hasMore });
  }

  try {
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: { nickname: { contains: q } },
        take: limit, skip
      });
      results.users = users;
      if (users.length === limit) hasMore = true;
    }

    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: { title: { contains: q } },
        take: limit, skip
      });
      results.posts = posts;
      if (posts.length === limit) hasMore = true;
    }

    if (type === 'all' || type === 'tags') {
      const tags = await prisma.tag.findMany({
        where: { name: { contains: q } },
        take: limit, skip
      });
      results.tags = tags;
      if (tags.length === limit) hasMore = true;
    }

    // Third-party API scraping is removed to start fresh as requested.
    
    res.json({ results, hasMore });
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/suggestions', apiLimiter, async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json([]);
  try {
    const users = await prisma.user.findMany({ where: { nickname: { contains: q } }, take: 5 });
    const tags = await prisma.tag.findMany({ where: { name: { contains: q } }, take: 5, include: { _count: { select: { posts: true } } } });
    const suggestions = [
      ...users.map(u => ({ type: 'user', value: u.nickname })),
      ...tags.map(t => ({ type: 'tag', value: t.name, count: t._count.posts }))
    ];
    res.json(suggestions);
  } catch (e) {
    res.json([]);
  }
});

export default router;
