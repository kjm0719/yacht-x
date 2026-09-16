import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { verifyAccessToken } from './utils/jwt.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import messageRoutes from './routes/message.routes.js';
import searchRoutes from './routes/search.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────── App setup ───────────────────────
const app = express();
const httpServer = createServer(app);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─────────────────────── Security Middleware ───────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────── Static File Serving ───────────────────────
// Serve uploaded media files
app.use('/uploads', express.static(uploadsDir));

// ─────────────────────── API Routes ───────────────────────
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────── Socket.IO ───────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
    credentials: true,
  },
});

// Auth middleware for socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const payload = verifyAccessToken(token);
    socket.data.userId = payload.userId;
    socket.data.role = payload.role;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId as string;
  console.log(`🔌 Socket connected: ${userId}`);

  // Join personal room for notifications
  socket.join(`user:${userId}`);

  // ── DM Chat ──
  socket.on('message:send', async (data: { receiverId: string; content: string }) => {
    if (!data.receiverId || !data.content?.trim()) return;

    const sanitized = data.content.replace(/[<>]/g, '').slice(0, 1000);

    try {
      const message = await prisma.message.create({
        data: { senderId: userId, receiverId: data.receiverId, content: sanitized },
      });

      // Emit to both sender and receiver rooms
      io.to(`user:${data.receiverId}`).to(`user:${userId}`).emit('message:new', message);

      // Push notification to receiver
      const sender = await prisma.user.findUnique({ where: { id: userId }, select: { nickname: true } });
      if (sender) {
        const notif = await prisma.notification.create({
          data: {
            type: 'MESSAGE',
            content: `${sender.nickname}님이 메시지를 보냈습니다.`,
            link: `/messages/${userId}`,
            userId: data.receiverId,
            actorId: userId,
          },
        });
        io.to(`user:${data.receiverId}`).emit('notification:new', notif);
      }
    } catch (err) {
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${userId}`);
  });
});

// ─────────────────────── Error Handler ───────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  // Never expose stack traces in production
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ error: message });
});

// ─────────────────────── Start ───────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});

export { io };
