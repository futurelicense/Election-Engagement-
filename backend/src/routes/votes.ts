import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly, adminOrSubAdmin, optionalAuth } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimit.js';
import { nanoid } from 'nanoid';

// 20 vote attempts per 10 minutes per IP (prevents spam voting via new accounts)
const voteRateLimit = createRateLimit(20, 10 * 60 * 1000);

const router = Router();

router.post('/', optionalAuth, voteRateLimit, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string } | undefined;
    const { electionId, candidateId, guestId } = req.body;
    if (!electionId || !candidateId) return res.status(400).json({ error: 'electionId and candidateId required' });
    const { data: candidate, error: candidateErr } = await supabase.from('candidates').select('id, election_id').eq('id', candidateId).single();
    if (candidateErr || !candidate) return res.status(400).json({ error: 'Candidate not found' });
    if (candidate.election_id !== electionId) return res.status(400).json({ error: 'Candidate does not belong to this election' });

    if (user) {
      const id = `v_${nanoid(12)}`;
      const { data, error } = await supabase.from('votes').insert({
        id,
        user_id: user.userId,
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
    }

    if (!guestId || typeof guestId !== 'string' || guestId.length > 64)
      return res.status(400).json({ error: 'guestId required for guest vote' });
    const gid = `gv_${nanoid(12)}`;
    const { data, error } = await supabase.from('guest_votes').insert({
      id: gid,
      guest_id: guestId.trim(),
      election_id: electionId,
      candidate_id: candidateId,
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'You have already voted in this election' });
      throw error;
    }
    return res.status(201).json({
      id: data.id,
      guestId: data.guest_id,
      electionId: data.election_id,
      candidateId: data.candidate_id,
      timestamp: data.timestamp,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to cast vote' });
  }
});

router.get('/check/:electionId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string } | undefined;
    const { electionId } = req.params;
    const guestId = (req.query.guestId as string)?.trim();

    if (user) {
      const { data } = await supabase.from('votes').select('*').eq('election_id', electionId).eq('user_id', user.userId).maybeSingle();
      if (!data) return res.json({ hasVoted: false, vote: null });
      return res.json({
        hasVoted: true,
        vote: { id: data.id, userId: data.user_id, electionId: data.election_id, candidateId: data.candidate_id, timestamp: data.timestamp },
      });
    }
    if (!guestId) return res.json({ hasVoted: false, vote: null });
    const { data } = await supabase.from('guest_votes').select('*').eq('election_id', electionId).eq('guest_id', guestId).maybeSingle();
    if (!data) return res.json({ hasVoted: false, vote: null });
    return res.json({
      hasVoted: true,
      vote: { id: data.id, candidateId: data.candidate_id, electionId: data.election_id, timestamp: data.timestamp },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to check vote' });
  }
});

router.post('/claim', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { guestId } = req.body;
    if (!guestId || typeof guestId !== 'string' || !guestId.trim()) return res.status(400).json({ error: 'guestId required' });
    const gid = guestId.trim();
    const { data: guestVotes, error: listErr } = await supabase.from('guest_votes').select('id, election_id, candidate_id').eq('guest_id', gid);
    if (listErr) throw listErr;
    if (!guestVotes?.length) return res.json({ claimed: 0 });
    let claimed = 0;
    for (const gv of guestVotes) {
      const { data: existing } = await supabase.from('votes').select('id').eq('user_id', userId).eq('election_id', gv.election_id).maybeSingle();
      if (existing) continue;
      const id = `v_${nanoid(12)}`;
      const { error: insErr } = await supabase.from('votes').insert({
        id,
        user_id: userId,
        election_id: gv.election_id,
        candidate_id: gv.candidate_id,
      });
      if (!insErr) {
        claimed++;
        await supabase.from('guest_votes').delete().eq('id', gv.id);
      }
    }
    return res.json({ claimed });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to claim votes' });
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

router.get('/stats/total', authMiddleware, adminOrSubAdmin, async (_req: Request, res: Response) => {
  try {
    const [{ count: userCount, error: e1 }, { count: guestCount, error: e2 }] = await Promise.all([
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('guest_votes').select('*', { count: 'exact', head: true }),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    return res.json({ totalVotes: (userCount ?? 0) + (guestCount ?? 0) });
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
