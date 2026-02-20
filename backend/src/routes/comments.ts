import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly, adminOrSubAdmin } from '../middleware/auth.js';
import { nanoid } from 'nanoid';

const router = Router();

type CommentWithMeta = {
  id: any;
  electionId: any;
  userId: any;
  userName: string;
  userAvatar: any;
  content: any;
  timestamp: any;
  likes: number;
  likedBy: any[];
  reactions: Record<string, string[]>;
  replies: CommentWithMeta[];
  flagged: boolean;
  approved: boolean;
};

async function commentWithMeta(comment: any, userId?: string): Promise<CommentWithMeta> {
  const { data: user } = await supabase.from('users').select('name, avatar').eq('id', comment.user_id).single();
  const { data: likes } = await supabase.from('comment_likes').select('user_id').eq('comment_id', comment.id);
  const { data: reactions } = await supabase.from('comment_reactions').select('user_id, emoji').eq('comment_id', comment.id);
  const likedBy = (likes || []).map((l: any) => l.user_id);
  const reactionsMap: Record<string, string[]> = {};
  for (const r of reactions || []) {
    if (!reactionsMap[r.emoji]) reactionsMap[r.emoji] = [];
    reactionsMap[r.emoji].push(r.user_id);
  }
  return {
    id: comment.id,
    electionId: comment.election_id,
    userId: comment.user_id,
    userName: (user as any)?.name ?? 'Unknown',
    userAvatar: (user as any)?.avatar,
    content: comment.content,
    timestamp: comment.timestamp,
    likes: likedBy.length,
    likedBy,
    reactions: reactionsMap,
    replies: [],
    flagged: !!comment.flagged,
    approved: comment.approved !== false,
  };
}

router.get('/election/:id', async (req: Request, res: Response) => {
  try {
    const includeReplies = req.query.includeReplies !== 'false';
    const { data: rows, error } = await supabase.from('comments').select('*').eq('election_id', req.params.id).is('parent_comment_id', null).order('timestamp', { ascending: false });
    if (error) throw error;
    const comments: CommentWithMeta[] = [];
    for (const c of rows || []) {
      const cm = await commentWithMeta(c);
      if (includeReplies) {
        const { data: replies } = await supabase.from('comments').select('*').eq('parent_comment_id', c.id).order('timestamp');
        cm.replies = await Promise.all((replies || []).map((r: any) => commentWithMeta(r)));
      }
      comments.push(cm);
    }
    return res.json(comments);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch comments' });
  }
});

router.get('/news/:id', async (req: Request, res: Response) => {
  return res.json([]);
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { electionId, newsId, parentCommentId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    if (!electionId) return res.status(400).json({ error: 'electionId is required' });
    const id = `cm_${nanoid(12)}`;
    const { data, error } = await supabase.from('comments').insert({
      id,
      election_id: electionId,
      user_id: userId,
      content: String(content).trim(),
      parent_comment_id: parentCommentId || null,
    }).select().single();
    if (error) throw error;
    const out = await commentWithMeta(data);
    return res.status(201).json(out);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create comment' });
  }
});

router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { data: existing } = await supabase.from('comment_likes').select('id').eq('comment_id', req.params.id).eq('user_id', userId).maybeSingle();
    if (existing) {
      await supabase.from('comment_likes').delete().eq('comment_id', req.params.id).eq('user_id', userId);
    } else {
      await supabase.from('comment_likes').insert({ comment_id: req.params.id, user_id: userId });
    }
    const { count } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).eq('comment_id', req.params.id);
    await supabase.from('comments').update({ likes: count ?? 0 }).eq('id', req.params.id);
    return res.json({});
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to like' });
  }
});

router.post('/:id/reaction', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'emoji required' });
    await supabase.from('comment_reactions').upsert({ comment_id: req.params.id, user_id: userId, emoji: String(emoji).slice(0, 10) }, { onConflict: 'comment_id,user_id,emoji' });
    return res.json({});
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to add reaction' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { content, approved, flagged } = req.body;
    const { data: comment } = await supabase.from('comments').select('user_id').eq('id', req.params.id).single();
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const canModerate = (req as any).user?.isAdmin || (req as any).user?.isSubAdmin;
    const payload: any = {};
    if (content !== undefined) {
      if (comment.user_id !== userId && !canModerate) return res.status(403).json({ error: 'Forbidden' });
      payload.content = content;
    }
    if (approved !== undefined || flagged !== undefined) {
      if (!canModerate) return res.status(403).json({ error: 'Admin or sub-admin required' });
      if (approved !== undefined) payload.approved = approved;
      if (flagged !== undefined) payload.flagged = flagged;
    }
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase.from('comments').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    const out = await commentWithMeta(data);
    return res.json(out);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update comment' });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { data: comment } = await supabase.from('comments').select('user_id').eq('id', req.params.id).single();
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const canModerate = (req as any).user?.isAdmin || (req as any).user?.isSubAdmin;
    if (comment.user_id !== userId && !canModerate) return res.status(403).json({ error: 'Forbidden' });
    await supabase.from('comments').delete().eq('id', req.params.id);
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete comment' });
  }
});

router.get('/admin/all', authMiddleware, adminOrSubAdmin, async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;
    let q = supabase.from('comments').select('*').order('timestamp', { ascending: false });
    if (filter === 'pending') q = q.eq('approved', false);
    if (filter === 'approved') q = q.eq('approved', true);
    if (filter === 'flagged') q = q.eq('flagged', true);
    const { data: rows, error } = await q;
    if (error) throw error;
    const comments = await Promise.all((rows || []).map((c: any) => commentWithMeta(c)));
    return res.json(comments);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch comments' });
  }
});

router.get('/admin/stats', authMiddleware, adminOrSubAdmin, async (_req: Request, res: Response) => {
  try {
    const { count: total } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('approved', false);
    return res.json({ totalComments: total ?? 0, pendingComments: pending ?? 0 });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch stats' });
  }
});

router.get('/admin/activity', authMiddleware, adminOrSubAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const { data: rows } = await supabase.from('comments').select('id, user_id, content, timestamp').order('timestamp', { ascending: false }).limit(limit);
    const activity = [];
    for (const r of rows || []) {
      const { data: u } = await supabase.from('users').select('name').eq('id', r.user_id).single();
      activity.push({
        type: 'comment',
        id: r.id,
        timestamp: r.timestamp,
        message: 'New comment',
        user: (u as any)?.name,
        content: (r.content || '').slice(0, 80),
      });
    }
    return res.json(activity);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch activity' });
  }
});

export default router;
