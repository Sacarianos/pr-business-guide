// Shared UI microcopy for a non-primary `sourcing` mark. `primary` gets no
// mark at all — an unmarked claim is the confirmed default — so this only
// ever has to answer for the other two. One copy shared by
// src/scripts/tool.ts (the client-rendered patente mark) and
// src/pages/index.astro (the server-rendered entity table, G-12), so the
// same figure reads the same way regardless of which section renders it.
//
// Every function here takes an optional `lang` (G-19: "Spanish default, "
// toggle preserves answers") — defaulting to 'es' keeps every call site
// written before G-19 unchanged, while src/pages/index.astro and
// src/scripts/tool.ts now pass the reader's current language explicitly.
import type { Professional, Sourcing, StepData } from './content-schema.ts';

export type Lang = 'es' | 'en';

export function sourcingLabel(sourcing: Exclude<Sourcing, 'primary'>, lang: Lang = 'es'): string {
  if (lang === 'en') return sourcing === 'secondary' ? 'unconfirmed' : 'unverified';
  return sourcing === 'secondary' ? 'sin confirmar' : 'sin verificar';
}

// The `practice` axis (0001, "Sourcing is two orthogonal fields, not one
// scale"). `contradicted` is the most valuable content on the page and must
// read as the loudest state, louder than an `unverified` sourcing mark
// (G-15) — src/pages/index.astro and src/scripts/tool.ts render it as a
// filled banner rather than the bordered tag `sourcingLabel` produces.
// `unknown` carries nothing worth telling a reader, so it renders nothing.
export type Practice = NonNullable<StepData['practice']>;

export function practiceHeadline(status: Practice['status'], lang: Lang = 'es'): string | null {
  if (lang === 'en') {
    switch (status) {
      case 'contradicted':
        return 'Practice contradicts this';
      case 'confirmed':
        return 'Confirmed in practice';
      case 'unknown':
        return null;
    }
  }
  switch (status) {
    case 'contradicted':
      return 'La práctica contradice esto';
    case 'confirmed':
      return 'Confirmado en la práctica';
    case 'unknown':
      return null;
  }
}

// `practice.at` is `z.coerce.date()` server-side, but content.json (G-04)
// serializes through JSON — so the copy src/scripts/tool.ts reads back is a
// plain string, not a Date, whatever the zod-inferred type claims. Handling
// both here, once, keeps every caller from having to know that. No `lang`
// parameter: a name and an ISO date read the same in either language.
export function practiceAttribution(practice: Practice): string {
  const date = practice.at instanceof Date ? practice.at : new Date(practice.at);
  return `${practice.by} — ${date.toISOString().slice(0, 10)}`;
}

// G-18 (0001, story 28): which decisions this guide can't finish for the
// reader. `undefined` means self-service is fine — most decisions are — so
// this only ever has to answer for the two professions that come up.
export function professionalLabel(professional: NonNullable<Professional>, lang: Lang = 'es'): string {
  if (lang === 'en') return professional === 'cpa' ? 'a Puerto Rico CPA' : 'an attorney';
  return professional === 'cpa' ? 'un CPA de Puerto Rico' : 'un abogado';
}
