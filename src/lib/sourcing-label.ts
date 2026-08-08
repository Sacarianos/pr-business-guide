// Shared UI microcopy for a non-primary `sourcing` mark. `primary` gets no
// mark at all — an unmarked claim is the confirmed default — so this only
// ever has to answer for the other two. One copy shared by
// src/scripts/tool.ts (the client-rendered patente mark) and
// src/pages/index.astro (the server-rendered entity table, G-12), so the
// same figure reads the same way regardless of which section renders it.
import type { Sourcing } from './content-schema.ts';

export function sourcingLabel(sourcing: Exclude<Sourcing, 'primary'>): string {
  return sourcing === 'secondary' ? 'sin confirmar' : 'sin verificar';
}
