import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const url = new URL(req.url);
  const code = url.searchParams.get('code')?.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!code || code.length !== 6) {
    return new Response(JSON.stringify({ error: 'Invalid code' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const store = getStore({ name: 'busybee-sync', consistency: 'strong' });

  // GET — download sync data
  if (req.method === 'GET') {
    try {
      const data = await store.get(code, { type: 'json' });
      if (!data) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(data), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ error: 'server_error' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
  }

  // POST — upload sync data
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      await store.setJSON(code, { ...body, updatedAt: Date.now() });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ error: 'server_error' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: CORS });
};

export const config: Config = { path: '/api/sync' };
