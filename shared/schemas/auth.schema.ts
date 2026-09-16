import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력하세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Z]/, '대문자를 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.'),
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(30, '닉네임은 30자 이하여야 합니다.')
    .regex(/^[a-zA-Z0-9가-힣_.]+$/, '닉네임은 영문, 숫자, 한글, _, . 만 사용 가능합니다.')
    .transform((v) => v.replace(/[<>]/g, '')),
  fullName: z
    .string()
    .max(50)
    .optional()
    .transform((v) => v?.replace(/[<>]/g, '')),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
});

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9가-힣_.]+$/)
    .optional(),
  fullName: z.string().max(50).optional(),
  bio: z.string().max(150).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
