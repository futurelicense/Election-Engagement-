import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
import { nanoid } from 'nanoid';

const router = Router();
const secret = process.env.JWT_SECRET!;

function toUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    avatar: row.avatar ?? undefined,
    savedCountries: [] as string[],
    isAdmin: !!row.is_admin,
  };
}

router.post('/register', async (req: Request, res: Response) => {
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
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Email already registered' });
      throw error;
    }
    const user = toUser(data);
    const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.isAdmin }, secret, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (e: any) {
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
    const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.isAdmin }, secret, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Login failed' });
  }
});

export default router;
