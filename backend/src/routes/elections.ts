import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('elections').select('*').order('date');
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch elections' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('elections').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Election not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch election' });
  }
});

router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { data: votes } = await supabase.from('votes').select('candidate_id').eq('election_id', req.params.id);
    const counts: Record<string, number> = {};
    for (const v of votes || []) {
      counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const { data: candidates } = await supabase.from('candidates').select('id, name, color').eq('election_id', req.params.id);
    const stats = (candidates || []).map((c: any) => ({
      candidateId: c.id,
      candidateName: c.name,
      votes: counts[c.id] || 0,
      percentage: total ? Math.round((counts[c.id] || 0) / total * 10000) / 100 : 0,
      color: c.color,
    }));
    return res.json(stats);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch stats' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { country_id, type, date, status, description } = req.body;
    if (!country_id || !type || !date || !description) return res.status(400).json({ error: 'country_id, type, date, description required' });
    const id = `e_${Date.now()}`;
    const { data, error } = await supabase.from('elections').insert({
      id,
      country_id,
      type,
      date,
      status: status || 'upcoming',
      description,
    }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create election' });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { country_id, type, date, status, description } = req.body;
    const payload: any = {};
    if (country_id !== undefined) payload.country_id = country_id;
    if (type !== undefined) payload.type = type;
    if (date !== undefined) payload.date = date;
    if (status !== undefined) payload.status = status;
    if (description !== undefined) payload.description = description;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase.from('elections').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Election not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update election' });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('elections').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete election' });
  }
});

export default router;
