#!/usr/bin/env node
/**
 * Set vote display override for candidates by name.
 * Usage:
 *   node scripts/set-vote-overrides.mjs <electionId> "Candidate A" <votes> "Candidate B" <votes> ...
 * Example:
 *   node scripts/set-vote-overrides.mjs e_123 "Tinubu" 5000 "Atiku" 3000 "Obi" 2000
 *
 * Loads backend/.env for SUPABASE_URL and SUPABASE_SERVICE_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const path = resolve(__dirname, '../.env');
  try {
    const content = readFileSync(path, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    return env;
  } catch (e) {
    console.error('Create backend/.env with SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 3 || args.length % 2 !== 1) {
    console.error('Usage: node set-vote-overrides.mjs <electionId> "Name1" <votes1> "Name2" <votes2> ...');
    process.exit(1);
  }
  const electionId = args[0];
  const pairs = [];
  for (let i = 1; i < args.length; i += 2) {
    const name = args[i];
    const votes = parseInt(args[i + 1], 10);
    if (Number.isNaN(votes) || votes < 0) {
      console.error('Invalid votes:', args[i + 1]);
      process.exit(1);
    }
    pairs.push({ name: name.trim(), votes });
  }
  return { electionId, pairs };
}

async function main() {
  const env = loadEnv();
  const { electionId, pairs } = parseArgs();
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY required in backend/.env');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: candidates, error: listErr } = await supabase
    .from('candidates')
    .select('id, name')
    .eq('election_id', electionId);

  if (listErr) {
    console.error('Failed to load candidates:', listErr.message);
    process.exit(1);
  }
  if (!candidates?.length) {
    console.error('No candidates found for election', electionId);
    process.exit(1);
  }

  const byName = new Map(candidates.map((c) => [c.name.toLowerCase().trim(), c]));
  const updates = [];

  for (const { name, votes } of pairs) {
    const key = name.toLowerCase().trim();
    const candidate = byName.get(key) || candidates.find((c) => c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase()));
    if (!candidate) {
      console.warn('Candidate not found:', name);
      continue;
    }
    updates.push({ id: candidate.id, name: candidate.name, votes });
  }

  for (const u of updates) {
    const { error } = await supabase.from('candidates').update({ vote_display_override: u.votes }).eq('id', u.id);
    if (error) {
      console.error('Failed to update', u.name, error.message);
      process.exit(1);
    }
    console.log('Set', u.name, '→', u.votes, 'votes');
  }

  console.log('Done.');
}

main();
