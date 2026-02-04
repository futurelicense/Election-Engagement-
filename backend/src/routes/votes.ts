import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { nanoid } from 'nanoid';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { electionId, candidateId } = req.body;
    if (!electionId || !candidateId) return res.status(400).json({ error: 'electionId and candidateId required' });
    const id = `v_${nanoid(12)}`;
    const { data, error } = await supabase.from('votes').insert({
      id,
      user_id: userId,
      election_id: electionId,
      candidate_id: candidateId,
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'You have already voted in this election' });
      throw error;
    }
    return res.status(201).json({
      id: data.id,
      userId: data.user_id,
      electionId: data.election_id,
      candidateId: data.candidate_id,
      timestamp: data.timestamp,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to cast vote' });
  }
});

router.get('/check/:electionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { data } = await supabase.from('votes').select('*').eq('election_id', req.params.electionId).eq('user_id', userId).maybeSingle();
    if (!data) return res.json({ hasVoted: false, vote: null });
    return res.json({
      hasVoted: true,
      vote: { id: data.id, userId: data.user_id, electionId: data.election_id, candidateId: data.candidate_id, timestamp: data.timestamp },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to check vote' });
  }
});

router.get('/user', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { data, error } = await supabase.from('votes').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
    if (error) throw error;
    const votes = (data || []).map((v: any) => ({ id: v.id, userId: v.user_id, electionId: v.election_id, candidateId: v.candidate_id, timestamp: v.timestamp }));
    return res.json(votes);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch votes' });
  }
});

router.get('/stats/total', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { count, error } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return res.json({ totalVotes: count ?? 0 });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch total votes' });
  }
});

router.get('/admin/all', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('votes').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch votes' });
  }
});

export default router;
