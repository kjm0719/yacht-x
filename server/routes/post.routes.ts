import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth, optionalAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { uploadLimiter, apiLimiter } from '../middleware/rateLimiter.js';
import { createPostSchema, createCommentSchema, postQuerySchema } from '../../shared/schemas/post.schema.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = Router();

// ─────────────────────── GET /api/posts ───────────────────────
// Paginated feed (cursor-based) — supports FEED and REEL
router.get('/', apiLimiter, optionalAuth, validate(postQuerySchema, 'query'), async (req: AuthRequest, res) => {
  const { type, cursor, limit, userId, tag } = req.query as unknown as {
    type?: string; cursor?: string; limit: number; userId?: string; tag?: string;
  };

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: {
      ...(type ? { type } : {}),
      ...(userId ? { authorId: userId } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      media: { orderBy: { order: 'asc' } },
      tags: { include: { tag: { select: { name: true } } } },
      _count: { select: { likes: true, comments: true } },
      ...(req.user ? {
        likes: { where: { userId: req.user.id }, select: { userId: true } }
      } : {}),
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const formatted = items.map((post) => ({
    ...post,
    likedByMe: req.user ? post.likes?.length > 0 : false,
    likes: undefined,
    tags: post.tags.map((pt) => pt.tag.name),
  }));

  res.json({ posts: formatted, nextCursor });
});

// ─────────────────────── GET /api/posts/:id ───────────────────────
router.get('/:id', apiLimiter, optionalAuth, async (req: AuthRequest, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      media: { orderBy: { order: 'asc' } },
      tags: { include: { tag: { select: { name: true } } } },
      _count: { select: { likes: true, comments: true } },
      ...(req.user ? {
        likes: { where: { userId: req.user.id }, select: { userId: true } }
      } : {}),
    },
  });

  if (!post) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    return;
  }

  res.json({
    ...post,
    likedByMe: req.user ? post.likes?.length > 0 : false,
    likes: undefined,
    tags: post.tags.map((pt) => pt.tag.name),
  });
});

// ─────────────────────── POST /api/posts ───────────────────────
router.post(
  '/',
  requireAuth,
  uploadLimiter,
  upload.array('media', 10),
  validate(createPostSchema),
  async (req: AuthRequest, res) => {
    const { caption, type, tags } = req.body;
    const files = (req.files as Express.Multer.File[]) ?? [];

    if (files.length === 0) {
      res.status(400).json({ error: '미디어 파일을 하나 이상 업로드하세요.' });
      return;
    }

    // Process images with Sharp (resize & optimize)
    const mediaData = await Promise.all(
      files.map(async (file, index) => {
        const isImage = file.mimetype.startsWith('image/');
        let url = `/uploads/${file.filename}`;
        let width: number | undefined;
        let height: number | undefined;

        if (isImage) {
          const outputFilename = `opt_${file.filename.replace(/\.[^.]+$/, '.webp')}`;
          const outputPath = path.join('uploads', outputFilename);
          const metadata = await sharp(file.path)
            .resize({ width: 1080, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);
          fs.unlinkSync(file.path); // delete original
          url = `/uploads/${outputFilename}`;
          width = metadata.width;
          height = metadata.height;
        }

        return {
          url,
          type: isImage ? ('IMAGE' as const) : ('VIDEO' as const),
          width,
          height,
          order: index,
        };
      })
    );

    // Upsert tags
    const tagConnects = await Promise.all(
      (tags as string[]).map(async (name: string) => {
        const tag = await prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        return { tagId: tag.id };
      })
    );

    const post = await prisma.post.create({
      data: {
        caption,
        type,
        authorId: req.user!.id,
        media: { create: mediaData },
        tags: { create: tagConnects },
      },
      include: {
        author: { select: { id: true, nickname: true, avatarUrl: true } },
        media: { orderBy: { order: 'asc' } },
        tags: { include: { tag: { select: { name: true } } } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    res.status(201).json({
      ...post,
      likedByMe: false,
      tags: post.tags.map((pt) => pt.tag.name),
    });
  }
);

// ─────────────────────── DELETE /api/posts/:id ───────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    return;
  }
  if (post.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: '삭제 권한이 없습니다.' });
    return;
  }
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ message: '삭제되었습니다.' });
});

// ─────────────────────── POST /api/posts/:id/like ───────────────────────
router.post('/:id/like', requireAuth, async (req: AuthRequest, res) => {
  const { id: postId } = req.params;
  const userId = req.user!.id;

  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });

  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    res.json({ liked: false });
  } else {
    await prisma.like.create({ data: { userId, postId } });

    // Create notification for post author (if not self-like)
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (post && post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'LIKE',
          content: `${req.user!.nickname}님이 회원님의 게시물을 좋아합니다.`,
          link: `/post/${postId}`,
          userId: post.authorId,
          actorId: userId,
        },
      });
    }
    res.json({ liked: true });
  }
});

// ─────────────────────── GET /api/posts/:id/comments ───────────────────────
router.get('/:id/comments', apiLimiter, async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { postId: req.params.id, parentId: null },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      replies: {
        include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  res.json({ comments });
});

// ─────────────────────── POST /api/posts/:id/comments ───────────────────────
router.post('/:id/comments', requireAuth, validate(createCommentSchema), async (req: AuthRequest, res) => {
  const { content, parentId } = req.body;
  const postId = req.params.id;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    return;
  }

  const comment = await prisma.comment.create({
    data: { content, postId, authorId: req.user!.id, parentId: parentId ?? null },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      replies: { include: { author: { select: { id: true, nickname: true, avatarUrl: true } } } },
    },
  });

  // Notify post author
  if (post.authorId !== req.user!.id) {
    await prisma.notification.create({
      data: {
        type: 'COMMENT',
        content: `${req.user!.nickname}님이 댓글을 남겼습니다: ${content.slice(0, 50)}`,
        link: `/post/${postId}`,
        userId: post.authorId,
        actorId: req.user!.id,
      },
    });
  }

  res.status(201).json({ comment });
});

// ─────────────────────── DELETE /api/posts/:postId/comments/:commentId ─────
router.delete('/:postId/comments/:commentId', requireAuth, async (req: AuthRequest, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
  if (!comment) {
    res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    return;
  }
  if (comment.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: '삭제 권한이 없습니다.' });
    return;
  }
  await prisma.comment.delete({ where: { id: req.params.commentId } });
  res.json({ message: '댓글이 삭제되었습니다.' });
});

export default router;
