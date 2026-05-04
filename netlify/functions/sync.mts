import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const url = new URL(req.url);
  const code = url.searchParams.get('code')?.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!code || code.length !== 6) return json({ error: 'invalid_code' }, 400);

  let store: ReturnType<typeof getStore>;
  try {
    // No consistency option — works on all Netlify plans (including free)
    store = getStore('busybee-sync');
  } catch (e) {
    return json({ error: 'store_init_failed', detail: String(e) }, 500);
  }

  if (req.method === 'GET') {
    try {
      const data = await store.get(code, { type: 'json' });
      if (!data) return json({ error: 'not_found' }, 404);
      return json(data);
    } catch (e) {
      return json({ error: 'get_failed', detail: String(e) }, 500);
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      await store.setJSON(code, { ...body, updatedAt: Date.now() });
      return json({ ok: true });
    } catch (e) {
      return json({ error: 'post_failed', detail: String(e) }, 500);
    }
  }

  return new Response('Method not allowed', { status: 405, headers: CORS });
};

export const config: Config = { path: '/api/sync' };
