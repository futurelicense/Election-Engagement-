import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { nanoid } from 'nanoid';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let q = supabase.from('candidates').select('*');
    const electionId = req.query.electionId as string;
    if (electionId) q = q.eq('election_id', electionId);
    const { data, error } = await q.order('name');
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch candidates' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('candidates').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Candidate not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch candidate' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { electionId, name, party, image, bio, color } = req.body;
    if (!electionId || !name || !party || !color) return res.status(400).json({ error: 'electionId, name, party, color required' });
    const id = `c_${nanoid(12)}`;
    const { data, error } = await supabase.from('candidates').insert({
      id,
      election_id: electionId,
      name: String(name).trim(),
      party: String(party).trim(),
      image: image ?? null,
      bio: bio ?? null,
      color: String(color).trim(),
    }).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create candidate' });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { electionId, name, party, image, bio, color } = req.body;
    const payload: any = {};
    if (electionId !== undefined) payload.election_id = electionId;
    if (name !== undefined) payload.name = name;
    if (party !== undefined) payload.party = party;
    if (image !== undefined) payload.image = image;
    if (bio !== undefined) payload.bio = bio;
    if (color !== undefined) payload.color = color;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase.from('candidates').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Candidate not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update candidate' });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('candidates').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete candidate' });
  }
});

export default router;
