import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, rotateTokens } from '../utils/jwt.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../../shared/schemas/auth.schema.js';
import { env } from '../config/env.js';

const router = Router();

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

// ─────────────────────── POST /api/auth/register ───────────────────────
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  const { email, password, nickname, fullName } = req.body;

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { nickname }] },
    select: { id: true, email: true, nickname: true },
  });

  if (exists?.email === email) {
    res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
    return;
  }
  if (exists?.nickname === nickname) {
    res.status(409).json({ error: '이미 사용 중인 닉네임입니다.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, nickname, fullName },
    select: { id: true, email: true, nickname: true, role: true },
  });

  const tokenPayload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.status(201).json({
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    accessToken,
  });
});

// ─────────────────────── POST /api/auth/login ───────────────────────
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, nickname: true, role: true, passwordHash: true, avatarUrl: true },
  });

  if (!user || !user.passwordHash) {
    // Generic error — don't reveal which field was wrong
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    return;
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    return;
  }

  const tokenPayload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json({
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role, avatarUrl: user.avatarUrl },
    accessToken,
  });
});

// ─────────────────────── POST /api/auth/refresh ───────────────────────
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const { accessToken, refreshToken } = await rotateTokens(token);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken });
  } catch (err) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// ─────────────────────── POST /api/auth/logout ───────────────────────
router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (token) {
    await prisma.refreshToken.updateMany({
      where: { token, userId: req.user!.id },
      data: { revoked: true },
    });
  }
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
  res.json({ message: '로그아웃되었습니다.' });
});

// ─────────────────────── GET /api/auth/me ───────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, email: true, nickname: true, fullName: true,
      avatarUrl: true, bio: true, website: true, role: true, createdAt: true,
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  res.json({ user });
});

export default router;
