import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// GET /api/messages/conversations — list of unique conversations
router.get('/conversations', requireAuth, apiLimiter, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // Get all unique conversation partners
  const sent = await prisma.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true, createdAt: true },
    distinct: ['receiverId'],
    orderBy: { createdAt: 'desc' },
  });
  const received = await prisma.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true, createdAt: true },
    distinct: ['senderId'],
    orderBy: { createdAt: 'desc' },
  });

  const partnerIds = new Set([
    ...sent.map((m) => m.receiverId),
    ...received.map((m) => m.senderId),
  ]);

  const conversations = await Promise.all(
    [...partnerIds].map(async (partnerId) => {
      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        select: { id: true, nickname: true, avatarUrl: true },
      });
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      const unreadCount = await prisma.message.count({
        where: { senderId: partnerId, receiverId: userId, isRead: false },
      });
      return { partner, lastMessage, unreadCount };
    })
  );

  conversations.sort((a, b) =>
    (b.lastMessage?.createdAt.getTime() ?? 0) - (a.lastMessage?.createdAt.getTime() ?? 0)
  );

  res.json({ conversations });
});

// GET /api/messages/:userId — full conversation with a user
router.get('/:userId', requireAuth, apiLimiter, async (req: AuthRequest, res) => {
  const myId = req.user!.id;
  const otherId = req.params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: myId, isRead: false },
    data: { isRead: true },
  });

  res.json({ messages });
});

// POST /api/messages — send a message
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content?.trim()) {
    res.status(400).json({ error: '수신자와 내용을 입력하세요.' });
    return;
  }

  const sanitizedContent = content.replace(/[<>]/g, '').slice(0, 1000);

  const message = await prisma.message.create({
    data: { senderId: req.user!.id, receiverId, content: sanitizedContent },
  });

  // Notify receiver
  await prisma.notification.create({
    data: {
      type: 'MESSAGE',
      content: `${req.user!.nickname}님이 메시지를 보냈습니다.`,
      link: `/messages/${req.user!.id}`,
      userId: receiverId,
      actorId: req.user!.id,
    },
  });

  res.status(201).json({ message });
});

export default router;
