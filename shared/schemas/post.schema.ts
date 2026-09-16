import { z } from 'zod';

export const createPostSchema = z.object({
  caption: z.string().max(2200).optional().transform((v) => v?.replace(/[<>]/g, '')),
  type: z.enum(['FEED', 'REEL']).default('FEED'),
  tags: z.array(z.string().max(30).regex(/^[a-zA-Z0-9가-힣]+$/)).max(30).default([]),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글을 입력하세요.')
    .max(500)
    .transform((v) => v.replace(/[<>]/g, '')),
  parentId: z.string().cuid().optional(),
});

export const postQuerySchema = z.object({
  type: z.enum(['FEED', 'REEL']).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().min(1).max(30).default(12),
  userId: z.string().cuid().optional(),
  tag: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
