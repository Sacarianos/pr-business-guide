// Shared shaping of the content collections into decision-tree.ts's
// `Content` type — used by both the content.json endpoint (G-04) and the
// page itself (G-08), so the two never drift into different shapes of the
// same seven collections.
import { getCollection } from 'astro:content';
import { PHASE_IDS } from './content-schema.ts';
import type { Content } from './decision-tree.ts';

function byId<T extends { id: string; data: unknown }>(entries: T[]) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry.data]));
}

export async function loadContent(): Promise<Content> {
  const [steps, questions, municipios, incentives, gaps, entities, phases] = await Promise.all([
    getCollection('steps'),
    getCollection('questions'),
    getCollection('municipios'),
    getCollection('incentives'),
    getCollection('gaps'),
    getCollection('entities'),
    getCollection('phases'),
  ]);

  // A per-entry schema can't say "exactly these five entries", so the
  // collection-level check lives here, where a mismatch fails the build.
  const phaseIds = phases.map((p) => p.id).sort();
  if (phaseIds.join() !== [...PHASE_IDS].sort().join()) {
    throw new Error(`content/phases.yaml must define exactly ${PHASE_IDS.join(', ')}; found ${phaseIds.join(', ')}`);
  }

  return {
    steps: byId(steps) as Content['steps'],
    questions: questions
      .map((q) => ({ id: q.id, ...q.data }))
      .sort((a, b) => a.order - b.order),
    municipios: byId(municipios) as Content['municipios'],
    incentives: byId(incentives) as Content['incentives'],
    gaps: gaps.map((g) => ({ id: g.id, ...g.data })),
    entities: byId(entities) as Content['entities'],
    phases: byId(phases) as Content['phases'],
  };
}
