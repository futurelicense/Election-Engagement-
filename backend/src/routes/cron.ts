import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase.js';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { authMiddleware, adminOrSubAdmin } from '../middleware/auth.js';

const router = Router();

// ─── Bot phrase lists (short, on-topic, respectful) ─────────────────────────────
const COMMENT_PHRASES = [
  'Every voice matters in this election. What do you think?',
  'Important to stay informed. Thanks for sharing.',
  'Let’s keep the conversation respectful and constructive.',
  'Good to see people engaging with the issues.',
  '2027 is a crucial moment. Let’s all participate.',
  'Have you checked the latest news on the platform?',
  'Agree we need more dialogue like this.',
  'What’s your take on the candidates’ positions?',
];

const CHAT_PHRASES = [
  'Hello everyone. Good to be here.',
  'Let’s keep the discussion focused on the issues.',
  'Remember to vote when the time comes.',
  'Stay civil and respect different views.',
  'Anyone else been following the news today?',
  'Thanks for having this space to discuss.',
];

const REACTION_EMOJIS = ['👍', '❤️', '🤔'];

// ─── Ensure bot users exist (create once if missing) ───────────────────────────
async function ensureBots(supabase: ReturnType<typeof getSupabase>): Promise<{ id: string; name: string }[]> {
  const { data: existing, error: fetchErr } = await supabase.from('users').select('id, name').eq('is_bot', true);
  if (fetchErr) {
    console.warn('Bot fetch failed (run migration to add is_bot?):', fetchErr.message);
    return [];
  }
  if (existing && existing.length > 0) return existing as { id: string; name: string }[];

  const pinHash = await bcrypt.hash('bot_nologin_secure', 10);
  const bots = [
    { id: 'bot_ada_001', name: 'Ada', email: 'bot_ada@election.local' },
    { id: 'bot_chidi_002', name: 'Chidi', email: 'bot_chidi@election.local' },
    { id: 'bot_zainab_003', name: 'Zainab', email: 'bot_zainab@election.local' },
  ];
  for (const b of bots) {
    const { error } = await supabase.from('users').upsert(
      {
        id: b.id,
        name: b.name,
        email: b.email,
        pin_hash: pinHash,
        is_bot: true,
        is_admin: false,
        is_sub_admin: false,
      },
      { onConflict: 'id' }
    );
    if (error) console.warn('Bot upsert warning:', error.message);
  }
  const { data: inserted } = await supabase.from('users').select('id, name').eq('is_bot', true);
  return (inserted || []) as { id: string; name: string }[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── One tick: pick one action and run it ──────────────────────────────────────
export async function runBotEngagementTick(): Promise<{
  ok: boolean;
  message: string;
  actions?: { type: string; detail?: string }[];
}> {
  const actions: { type: string; detail?: string }[] = [];
  const supabase = getSupabase();

  try {
    const bots = await ensureBots(supabase);
    if (bots.length === 0) {
      return { ok: true, message: 'No bots configured', actions: [] };
    }

    const bot = pick(bots);
    const actionType = pick(['comment', 'comment', 'like', 'reaction', 'chat']); // weight comment more

    if (actionType === 'comment') {
      const { data: elections } = await supabase.from('elections').select('id').limit(20);
      const electionIds = (elections || []).map((e: any) => e.id);
      if (electionIds.length === 0) {
        actions.push({ type: 'comment', detail: 'no elections' });
      } else {
        const electionId = pick(electionIds);
        const content = pick(COMMENT_PHRASES);
        const id = 'cm_' + nanoid(12);
        const { error } = await supabase.from('comments').insert({
          id,
          election_id: electionId,
          user_id: bot.id,
          parent_comment_id: null,
          content,
          likes: 0,
          flagged: false,
          approved: true,
        });
        if (!error) {
          actions.push({ type: 'comment', detail: electionId });
        } else {
          actions.push({ type: 'comment', detail: 'error: ' + error.message });
        }
      }
    } else if (actionType === 'like' || actionType === 'reaction') {
      const { data: comments } = await supabase
        .from('comments')
        .select('id, election_id')
        .is('parent_comment_id', null)
        .order('timestamp', { ascending: false })
        .limit(50);
      if (!comments?.length) {
        actions.push({ type: actionType, detail: 'no comments' });
      } else {
        const comment = pick(comments);
        const { data: already } = await supabase
          .from(actionType === 'like' ? 'comment_likes' : 'comment_reactions')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', bot.id)
          .maybeSingle();
        if (already) {
          actions.push({ type: actionType, detail: 'already done' });
        } else {
          if (actionType === 'like') {
            await supabase.from('comment_likes').insert({ comment_id: comment.id, user_id: bot.id });
            const { count } = await supabase
              .from('comment_likes')
              .select('*', { count: 'exact', head: true })
              .eq('comment_id', comment.id);
            await supabase.from('comments').update({ likes: count ?? 0 }).eq('id', comment.id);
            actions.push({ type: 'like', detail: comment.id });
          } else {
            const emoji = pick(REACTION_EMOJIS);
            await supabase.from('comment_reactions').upsert(
              { comment_id: comment.id, user_id: bot.id, emoji },
              { onConflict: 'comment_id,user_id,emoji' }
            );
            actions.push({ type: 'reaction', detail: emoji + ' on ' + comment.id });
          }
        }
      }
    } else {
      const { data: rooms } = await supabase.from('chat_rooms').select('id').limit(50);
      if (!rooms?.length) {
        actions.push({ type: 'chat', detail: 'no rooms' });
      } else {
        const room = pick(rooms);
        const content = pick(CHAT_PHRASES);
        const id = 'msg_' + nanoid(12);
        const { error } = await supabase.from('chat_messages').insert({
          id,
          room_id: room.id,
          user_id: bot.id,
          content,
          flagged: false,
          deleted: false,
          is_pinned: false,
        });
        if (!error) {
          actions.push({ type: 'chat', detail: room.id });
        } else {
          actions.push({ type: 'chat', detail: 'error: ' + error.message });
        }
      }
    }

    return {
      ok: true,
      message: 'Bot engagement tick completed',
      actions,
    };
  } catch (e: any) {
    console.error('Bot tick error:', e);
    return {
      ok: false,
      message: e?.message || 'Bot tick failed',
      actions: [{ type: 'error', detail: e?.message }],
    };
  }
}

/** Persist a bot run to bot_runs (if table exists). */
async function persistBotRun(
  supabase: ReturnType<typeof getSupabase>,
  result: { ok: boolean; message: string; actions?: { type: string; detail?: string }[] },
  trigger: 'cron' | 'admin'
) {
  try {
    await supabase.from('bot_runs').insert({
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      success: result.ok,
      message: result.message,
      actions: result.actions || [],
      trigger,
    });
  } catch (e) {
    console.warn('Could not persist bot run:', (e as Error)?.message);
  }
}

router.get('/bot-engagement', async (_req: Request, res: Response) => {
  const secret = process.env.CRON_SECRET;
  const auth = _req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!secret || secret.length < 16) {
    return res.status(503).json({
      error: 'Cron not configured',
      hint: 'Set CRON_SECRET (16+ characters) in Vercel Environment Variables.',
    });
  }

  if (token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await runBotEngagementTick();
    await persistBotRun(getSupabase(), result, 'cron');
    return res.json(result);
  } catch (e: any) {
    console.error('Bot engagement tick error:', e);
    return res.status(500).json({
      ok: false,
      error: e?.message || 'Bot tick failed',
    });
  }
});

// ─── Admin: view runs and trigger run ───────────────────────────────────────
router.get('/admin/runs', authMiddleware, adminOrSubAdmin, async (_req: Request, res: Response) => {
  try {
    const limit = Math.min(Number((_req as any).query?.limit) || 50, 100);
    const { data, error } = await getSupabase()
      .from('bot_runs')
      .select('id, started_at, completed_at, success, message, actions, trigger')
      .order('started_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return res.json({ runs: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch bot runs' });
  }
});

router.post('/admin/run', authMiddleware, adminOrSubAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await runBotEngagementTick();
    await persistBotRun(getSupabase(), result, 'admin');
    return res.json(result);
  } catch (e: any) {
    console.error('Admin bot run error:', e);
    return res.status(500).json({ ok: false, error: (e as Error)?.message || 'Bot run failed' });
  }
});

export default router;
