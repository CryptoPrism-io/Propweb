import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Serve /data and /photos from public/ during tests
globalThis.fetch = (async (input: any) => {
  const url = String(input);
  if (url.startsWith('/')) {
    const file = resolve(process.cwd(), 'public', url.replace(/^\//, ''));
    const body = readFileSync(file, 'utf-8');
    return { ok: true, json: async () => JSON.parse(body) } as Response;
  }
  throw new Error(`Unmocked fetch: ${url}`);
}) as typeof fetch;
