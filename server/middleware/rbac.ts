import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

type RoleLevel = 'USER' | 'MODERATOR' | 'ADMIN';

const roleHierarchy: Record<RoleLevel, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
};

/** Require minimum role level */
export function requireRole(minRole: RoleLevel) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const userLevel = roleHierarchy[req.user.role as RoleLevel] ?? 0;
    const requiredLevel = roleHierarchy[minRole];
    if (userLevel < requiredLevel) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
