import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('countries').select('*').order('name');
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch countries' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('countries').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Country not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch country' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, flag, code } = req.body;
    if (!name || !flag || !code) return res.status(400).json({ error: 'Name, flag, and code are required' });
    const id = `c_${nanoid(12)}`;
    const { data, error } = await supabase.from('countries').insert({ id, name, flag, code }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create country' });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, flag, code } = req.body;
    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (flag !== undefined) payload.flag = flag;
    if (code !== undefined) payload.code = code;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase.from('countries').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Country not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update country' });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('countries').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete country' });
  }
});

export default router;
