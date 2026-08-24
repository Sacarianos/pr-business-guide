// G-15: "Sourcing marks in the UI, `practice.contradicted` most prominent."
// These are the pure microcopy functions src/scripts/tool.ts and
// src/pages/index.astro both render from — kept here, framework-free, same
// reason src/lib/sourcing-label.ts's existing `sourcingLabel` is tested this
// way rather than through a rendered page.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  practiceAttribution,
  practiceHeadline,
  sourcingLabel,
} from '../src/lib/sourcing-label.ts';

test('sourcingLabel: secondary reads "sin confirmar", unverified reads "sin verificar"', () => {
  assert.equal(sourcingLabel('secondary'), 'sin confirmar');
  assert.equal(sourcingLabel('unverified'), 'sin verificar');
});

test('practiceHeadline: contradicted and confirmed each get a headline, unknown gets none', () => {
  assert.equal(practiceHeadline('contradicted'), 'La práctica contradice esto');
  assert.equal(practiceHeadline('confirmed'), 'Confirmado en la práctica');
  assert.equal(practiceHeadline('unknown'), null);
});

test('practiceAttribution: formats "by — YYYY-MM-DD" from a Date instance', () => {
  const attribution = practiceAttribution({
    status: 'contradicted',
    by: 'Alan Taveras / CUD',
    at: new Date('2026-08-24T00:00:00Z'),
  });
  assert.equal(attribution, 'Alan Taveras / CUD — 2026-08-24');
});

test('practiceAttribution: formats the same way when `at` arrives as a JSON-round-tripped string', () => {
  // content.json (G-04) serializes through JSON, so the client-side copy of
  // `practice.at` that src/scripts/tool.ts reads is a string, not a Date,
  // regardless of what the zod schema's `z.coerce.date()` says the type is
  // server-side — this must not throw or produce "Invalid Date".
  const attribution = practiceAttribution({
    status: 'confirmed',
    by: 'a practitioner',
    at: '2026-08-24T00:00:00.000Z' as unknown as Date,
  });
  assert.equal(attribution, 'a practitioner — 2026-08-24');
});
