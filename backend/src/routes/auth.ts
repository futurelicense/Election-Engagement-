import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
import { nanoid } from 'nanoid';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set. Add it to backend/.env or repo root .env.');
  return s;
}

function toUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    avatar: row.avatar ?? undefined,
    savedCountries: [] as string[],
    isAdmin: !!row.is_admin,
    isSubAdmin: !!row.is_sub_admin,
  };
}

/** Token expiry: 3 days. If user role is changed in DB, they keep old role until expiry; consider re-login or refresh that re-reads roles. */
function signToken(user: { id: string; email: string; isAdmin: boolean; isSubAdmin: boolean }) {
  return jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.isAdmin, isSubAdmin: user.isSubAdmin },
    getSecret(),
    { expiresIn: '3d' }
  );
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const secret = getSecret();
    const { name, email, phone, pin } = req.body;
    if (!name || !email || !pin) {
      return res.status(400).json({ error: 'Name, email, and pin are required' });
    }
    const pinHash = await bcrypt.hash(String(pin), 10);
    const id = `user_${nanoid(12)}`;
    const { data, error } = await supabase.from('users').insert({
      id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      pin_hash: pinHash,
      is_admin: false,
      is_sub_admin: false,
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Email already registered' });
      throw error;
    }
    const user = toUser(data);
    const token = signToken(user);
    return res.json({ user, token });
  } catch (e: any) {
    if (e?.message?.includes('JWT_SECRET')) return res.status(503).json({ error: e.message });
    return res.status(500).json({ error: e.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) {
      return res.status(400).json({ error: 'Email and pin are required' });
    }
    const { data, error } = await supabase.from('users').select('*').eq('email', String(email).trim().toLowerCase()).single();
    if (error || !data) {
      return res.status(401).json({ error: 'Invalid email or pin' });
    }
    const ok = await bcrypt.compare(String(pin), data.pin_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or pin' });
    const user = toUser(data);
    const token = signToken(user);
    return res.json({ user, token });
  } catch (e: any) {
    if (e?.message?.includes('JWT_SECRET')) return res.status(503).json({ error: e.message });
    return res.status(500).json({ error: e.message || 'Login failed' });
  }
});

// List sub-admins (full admin only)
router.get('/sub-admins', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('is_sub_admin', true)
      .order('id');
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to list sub-admins' });
  }
});

// Create sub-admin (full admin only)
router.post('/sub-admin', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, pin } = req.body;
    if (!name || !email || !pin) {
      return res.status(400).json({ error: 'Name, email, and pin are required' });
    }
    const pinHash = await bcrypt.hash(String(pin), 10);
    const id = `user_${nanoid(12)}`;
    const { data, error } = await supabase.from('users').insert({
      id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      pin_hash: pinHash,
      is_admin: false,
      is_sub_admin: true,
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Email already registered' });
      throw error;
    }
    const user = toUser(data);
    return res.status(201).json({ user });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create sub-admin' });
  }
});

export default router;
