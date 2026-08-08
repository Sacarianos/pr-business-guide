// Publishes content/*.yaml as a single static JSON asset (G-04). Two
// consumers: cud-agente fetches this URL at startup and caches it (A-02,
// "content is published, not duplicated" — one source of truth for both
// surfaces); and this repo's own decision-tree module (G-06) is fed this
// exact built artifact as its test fixture (0001, "tests feed the real
// built content.json into Seam A as a fixture, so the build is validated
// by being used").
import { loadContent } from '../lib/load-content.ts';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const content = await loadContent();
  return new Response(JSON.stringify(content), {
    headers: { 'Content-Type': 'application/json' },
  });
};
