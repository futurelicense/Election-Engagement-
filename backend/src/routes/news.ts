import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { nanoid } from 'nanoid';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let q = supabase.from('news').select('*');
    const countryId = req.query.countryId as string;
    const priority = req.query.priority as string;
    if (countryId) q = q.eq('country_id', countryId);
    if (priority) q = q.eq('priority', priority);
    const { data, error } = await q.order('timestamp', { ascending: false });
    if (error) throw error;
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch news' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('news').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'News not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch news' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { countryId, electionId, title, content, image, priority, tags, hashtags } = req.body;
    if (!countryId || !title || !content) return res.status(400).json({ error: 'countryId, title, content required' });
    const id = `n_${nanoid(12)}`;
    const { data: news, error: newsErr } = await supabase.from('news').insert({
      id,
      country_id: countryId,
      election_id: electionId || null,
      title: String(title).trim(),
      content: String(content).trim(),
      image: image || null,
      priority: priority || 'general',
    }).select().single();
    if (newsErr) throw newsErr;
    const tagList = Array.isArray(tags) ? tags : [];
    const hashList = Array.isArray(hashtags) ? hashtags : [];
    for (const tag of tagList) {
      await supabase.from('news_tags').insert({ news_id: id, tag: String(tag) });
    }
    for (const h of hashList) {
      await supabase.from('news_hashtags').insert({ news_id: id, hashtag: String(h) });
    }
    return res.status(201).json(news);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create news' });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { countryId, electionId, title, content, image, priority, tags, hashtags } = req.body;
    const payload: any = {};
    if (countryId !== undefined) payload.country_id = countryId;
    if (electionId !== undefined) payload.election_id = electionId;
    if (title !== undefined) payload.title = title;
    if (content !== undefined) payload.content = content;
    if (image !== undefined) payload.image = image;
    if (priority !== undefined) payload.priority = priority;
    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('news').update(payload).eq('id', req.params.id);
      if (error) throw error;
    }
    if (Array.isArray(tags)) {
      await supabase.from('news_tags').delete().eq('news_id', req.params.id);
      for (const tag of tags) await supabase.from('news_tags').insert({ news_id: req.params.id, tag: String(tag) });
    }
    if (Array.isArray(hashtags)) {
      await supabase.from('news_hashtags').delete().eq('news_id', req.params.id);
      for (const h of hashtags) await supabase.from('news_hashtags').insert({ news_id: req.params.id, hashtag: String(h) });
    }
    const { data, error } = await supabase.from('news').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'News not found' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update news' });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('news').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete news' });
  }
});

export default router;
