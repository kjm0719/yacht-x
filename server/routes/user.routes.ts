import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { imageUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../../shared/schemas/auth.schema.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = Router();

// ─────────────────────── GET /api/users/:nickname ───────────────────────
router.get('/:nickname', apiLimiter, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { nickname: req.params.nickname },
    select: {
      id: true, nickname: true, fullName: true, avatarUrl: true, bio: true, website: true, createdAt: true,
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    return;
  }
  res.json({ user });
});

// ─────────────────────── PATCH /api/users/me ───────────────────────
router.patch('/me', requireAuth, validate(updateProfileSchema), async (req: AuthRequest, res) => {
  const { nickname, fullName, bio, website } = req.body;

  if (nickname) {
    const existing = await prisma.user.findFirst({ where: { nickname, NOT: { id: req.user!.id } } });
    if (existing) {
      res.status(409).json({ error: '이미 사용 중인 닉네임입니다.' });
      return;
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { nickname, fullName, bio, website },
    select: { id: true, nickname: true, fullName: true, avatarUrl: true, bio: true, website: true },
  });
  res.json({ user });
});

// ─────────────────────── POST /api/users/me/avatar ───────────────────────
router.post('/me/avatar', requireAuth, imageUpload.single('avatar'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: '이미지 파일을 업로드하세요.' });
    return;
  }

  const outputFilename = `avatar_${req.user!.id}.webp`;
  const outputPath = path.join('uploads', outputFilename);

  await sharp(req.file.path)
    .resize(300, 300, { fit: 'cover' })
    .webp({ quality: 90 })
    .toFile(outputPath);

  fs.unlinkSync(req.file.path);

  const avatarUrl = `/uploads/${outputFilename}`;
  await prisma.user.update({ where: { id: req.user!.id }, data: { avatarUrl } });

  res.json({ avatarUrl });
});

// ─────────────────────── POST /api/users/:id/follow ───────────────────────
router.post('/:id/follow', requireAuth, async (req: AuthRequest, res) => {
  const followingId = req.params.id;
  const followerId = req.user!.id;

  if (followingId === followerId) {
    res.status(400).json({ error: '자기 자신을 팔로우할 수 없습니다.' });
    return;
  }

  const target = await prisma.user.findUnique({ where: { id: followingId }, select: { id: true } });
  if (!target) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    return;
  }

  const existing = await prisma.follows.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follows.delete({ where: { followerId_followingId: { followerId, followingId } } });
    res.json({ following: false });
  } else {
    await prisma.follows.create({ data: { followerId, followingId } });

    await prisma.notification.create({
      data: {
        type: 'FOLLOW',
        content: `${req.user!.nickname}님이 회원님을 팔로우하기 시작했습니다.`,
        link: `/profile/${req.user!.nickname}`,
        userId: followingId,
        actorId: followerId,
      },
    });
    res.json({ following: true });
  }
});

// ─────────────────────── GET /api/users/:id/follow-status ───────────────
router.get('/:id/follow-status', requireAuth, async (req: AuthRequest, res) => {
  const exists = await prisma.follows.findUnique({
    where: { followerId_followingId: { followerId: req.user!.id, followingId: req.params.id } },
  });
  res.json({ following: !!exists });
});

export default router;
