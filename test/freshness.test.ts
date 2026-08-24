// G-17: "Research date and freshness stamp" (0001, story 27 — "I want to
// know when the research was done, so that I can judge whether it has gone
// stale"). Pure formatting, tested the same way as sourcing-label.ts's
// microcopy: no DOM, no astro:content.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { RESEARCH_DATE, researchDateLabel } from '../src/lib/freshness.ts';

test('RESEARCH_DATE matches the compile date recorded in the research document itself', () => {
  // docs/research/starting-a-business-in-puerto-rico.md: "Research date:
  // 2026-08-06" and "Compiled 2026-08-06." at the top and bottom of the
  // document — this constant is the one place that date is duplicated into
  // code, so it stays in ISO form for an exact string match against both.
  assert.equal(RESEARCH_DATE, '2026-08-06');
});

test('researchDateLabel() renders the ISO date as long-form Spanish', () => {
  assert.equal(researchDateLabel(), '6 de agosto de 2026');
});
