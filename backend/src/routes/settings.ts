import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('platform_settings').select('setting_key, setting_value');
    if (error) throw error;
    const out: Record<string, string> = {};
    for (const row of data || []) {
      out[row.setting_key] = row.setting_value ?? '';
    }
    return res.json(out);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch settings' });
  }
});

router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('setting_key, setting_value')
      .eq('setting_key', req.params.key)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Setting not found' });
    return res.json({ key: data.setting_key, value: data.setting_value ?? '' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch setting' });
  }
});

router.put('/:key', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    const key = req.params.key;
    const { error } = await supabase.from('platform_settings').upsert({ setting_key: key, setting_value: value ?? '' }, { onConflict: 'setting_key' });
    if (error) throw error;
    return res.json({ key, value: value ?? '' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update setting' });
  }
});

router.delete('/:key', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('platform_settings').delete().eq('setting_key', req.params.key);
    if (error) throw error;
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete setting' });
  }
});

export default router;
