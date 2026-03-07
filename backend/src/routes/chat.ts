import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { nanoid } from 'nanoid';

const router = Router();

async function toRoom(row: any) {
  const { data: mods } = await supabase.from('chat_moderators').select('user_id').eq('room_id', row.id);
  const { data: pins } = await supabase.from('chat_messages').select('id').eq('room_id', row.id).eq('is_pinned', true);
  return {
    id: row.id,
    type: row.type,
    entityId: row.entity_id,
    name: row.name,
    description: row.description ?? '',
    moderators: (mods || []).map((m: any) => m.user_id),
    pinnedMessages: (pins || []).map((p: any) => p.id),
    createdAt: row.created_at,
    activeUsers: row.active_users ?? 0,
  };
}

router.get('/rooms', async (req: Request, res: Response) => {
  try {
    let q = supabase.from('chat_rooms').select('*');
    const type = req.query.type as string;
    const entityId = req.query.entityId as string;
    if (type) q = q.eq('type', type);
    if (entityId) q = q.eq('entity_id', entityId);
    const { data: rows, error } = await q.order('name');
    if (error) throw error;
    const rooms = await Promise.all((rows || []).map((r: any) => toRoom(r)));
    return res.json(rooms);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch rooms' });
  }
});

router.get('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const { data: row, error } = await supabase.from('chat_rooms').select('*').eq('id', req.params.id).single();
    if (error || !row) return res.status(404).json({ error: 'Room not found' });
    const room = await toRoom(row);
    return res.json(room);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch room' });
  }
});

router.post('/rooms', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { type, entity_id, entityId, name, description } = req.body;
    const eid = entity_id ?? entityId;
    if (!type || !eid || !name) return res.status(400).json({ error: 'type, entityId, name required' });
    const id = `${type}_${eid}`;
    const { data, error } = await supabase.from('chat_rooms').insert({
      id,
      type,
      entity_id: eid,
      name,
      description: description ?? null,
      active_users: 0,
    }).select().single();
    if (error) throw error;
    const room = await toRoom(data);
    return res.status(201).json(room);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create room' });
  }
});

router.put('/rooms/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase.from('chat_rooms').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Room not found' });
    const room = await toRoom(data);
    return res.json(room);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update room' });
  }
});

router.delete('/rooms/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('chat_rooms').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete room' });
  }
});

router.get('/rooms/:id/messages', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const { data: rows, error } = await supabase.from('chat_messages').select('*').eq('room_id', req.params.id).eq('deleted', false).order('timestamp', { ascending: false }).limit(limit);
    if (error) throw error;
    const messages = [];
    for (const m of (rows || []).reverse()) {
      const { data: u } = await supabase.from('users').select('name, avatar').eq('id', m.user_id).single();
      messages.push({
        id: m.id,
        roomId: m.room_id,
        userId: m.user_id,
        userName: (u as any)?.name ?? 'Unknown',
        userAvatar: (u as any)?.avatar,
        content: m.content,
        timestamp: m.timestamp,
        reactions: m.reactions ?? {},
        flagged: !!m.flagged,
        deleted: !!m.deleted,
        isPinned: !!m.is_pinned,
      });
    }
    return res.json(messages);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch messages' });
  }
});

router.post('/rooms/:id/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    const id = `msg_${nanoid(12)}`;
    const { data: u } = await supabase.from('users').select('name, avatar').eq('id', userId).single();
    const { data, error } = await supabase.from('chat_messages').insert({
      id,
      room_id: req.params.id,
      user_id: userId,
      content: String(content).trim(),
      flagged: false,
      deleted: false,
      is_pinned: false,
    }).select().single();
    if (error) throw error;
    return res.status(201).json({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      userName: (u as any)?.name ?? 'Unknown',
      userAvatar: (u as any)?.avatar,
      content: data.content,
      timestamp: data.timestamp,
      reactions: {},
      flagged: false,
      deleted: false,
      isPinned: false,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to send message' });
  }
});

router.put('/messages/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { content, flagged, deleted, is_pinned } = req.body;
    const { data: msg } = await supabase.from('chat_messages').select('user_id').eq('id', req.params.id).single();
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    const isAdmin = (req as any).user?.isAdmin;
    const payload: any = {};
    if (content !== undefined) { if (msg.user_id !== userId && !isAdmin) return res.status(403).json({ error: 'Forbidden' }); payload.content = content; }
    if (flagged !== undefined && isAdmin) payload.flagged = flagged;
    if (deleted !== undefined && isAdmin) payload.deleted = deleted;
    if (is_pinned !== undefined && isAdmin) payload.is_pinned = is_pinned;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase.from('chat_messages').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    const { data: u } = await supabase.from('users').select('name, avatar').eq('id', data.user_id).single();
    return res.json({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      userName: (u as any)?.name ?? 'Unknown',
      userAvatar: (u as any)?.avatar,
      content: data.content,
      timestamp: data.timestamp,
      reactions: data.reactions ?? {},
      flagged: !!data.flagged,
      deleted: !!data.deleted,
      isPinned: !!data.is_pinned,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update message' });
  }
});

router.delete('/messages/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { data: msg } = await supabase.from('chat_messages').select('user_id').eq('id', req.params.id).single();
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.user_id !== userId && !(req as any).user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    await supabase.from('chat_messages').update({ deleted: true }).eq('id', req.params.id);
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete message' });
  }
});

router.get('/messages/flagged', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('flagged', true).order('timestamp', { ascending: false });
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch flagged messages' });
  }
});

export default router;
