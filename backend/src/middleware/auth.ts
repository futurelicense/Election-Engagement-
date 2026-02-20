import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Add it to backend/.env or repo root .env and restart.');
  }
  return secret;
}

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  isSubAdmin: boolean;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let secret: string;
  try {
    secret = getSecret();
  } catch (e: any) {
    return res.status(503).json({ error: e?.message || 'Server not configured for auth' });
  }
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, secret) as unknown as JwtPayload;
    (req as Request & { user: JwtPayload }).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: JwtPayload }).user;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/** Allow full admin or sub-admin (news, comments, analytics only). */
export function adminOrSubAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: JwtPayload }).user;
  if (!user?.isAdmin && !user?.isSubAdmin) {
    return res.status(403).json({ error: 'Admin or sub-admin access required' });
  }
  next();
}
