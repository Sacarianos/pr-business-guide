// Shared shaping of the content collections into decision-tree.ts's
// `Content` type — used by both the content.json endpoint (G-04) and the
// page itself (G-08), so the two never drift into different shapes of the
// same five collections.
import { getCollection } from 'astro:content';
import type { Content } from './decision-tree.ts';

function byId<T extends { id: string; data: unknown }>(entries: T[]) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry.data]));
}

export async function loadContent(): Promise<Content> {
  const [steps, questions, municipios, incentives, gaps] = await Promise.all([
    getCollection('steps'),
    getCollection('questions'),
    getCollection('municipios'),
    getCollection('incentives'),
    getCollection('gaps'),
  ]);

  return {
    steps: byId(steps) as Content['steps'],
    questions: questions
      .map((q) => ({ id: q.id, ...q.data }))
      .sort((a, b) => a.order - b.order),
    municipios: byId(municipios) as Content['municipios'],
    incentives: byId(incentives) as Content['incentives'],
    gaps: gaps.map((g) => ({ id: g.id, ...g.data })),
  };
}
