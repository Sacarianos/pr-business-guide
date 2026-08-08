// G-05: "Build fails on any claim missing its sourcing mark." The build
// itself fails via Astro's content-collection validation (it runs these
// same schemas against content/*.yaml at build time); this suite guards
// the schema in isolation so a future edit that loosens `sourcing` to
// `.optional()` fails a fast, obvious test instead of silently letting an
// unmarked claim reach production.
//
// Imports content-schema.ts directly — no astro:content, no build step —
// so this stays a plain node:test module like the rest of the suite.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  bilingual,
  claimFields,
  stepSchema,
  municipioSchema,
  incentiveSchema,
  gapSchema,
} from '../src/lib/content-schema.ts';

const es_en = { es: 'es', en: 'en' };

const validStep = {
  title: es_en,
  agency: es_en,
  timing: es_en,
  cost: es_en,
  note: es_en,
  sourcing: 'primary',
};

const validMunicipio = {
  name: 'Test',
  rate: { type: 'flat', percent: 0.005 },
  sourcing: 'primary',
};

const validIncentive = {
  title: es_en,
  note: es_en,
  sourcing: 'primary',
};

test('a step missing `sourcing` fails validation', () => {
  const { sourcing, ...withoutSourcing } = validStep;
  assert.throws(() => stepSchema.parse(withoutSourcing));
  assert.doesNotThrow(() => stepSchema.parse(validStep));
});

test('a municipio missing `sourcing` fails validation', () => {
  const { sourcing, ...withoutSourcing } = validMunicipio;
  assert.throws(() => municipioSchema.parse(withoutSourcing));
  assert.doesNotThrow(() => municipioSchema.parse(validMunicipio));
});

test('an incentive missing `sourcing` fails validation', () => {
  const { sourcing, ...withoutSourcing } = validIncentive;
  assert.throws(() => incentiveSchema.parse(withoutSourcing));
  assert.doesNotThrow(() => incentiveSchema.parse(validIncentive));
});

test('`sourcing` rejects values outside primary/secondary/unverified', () => {
  assert.throws(() => stepSchema.parse({ ...validStep, sourcing: 'confirmed' }));
});

test('a gap does not require `sourcing` — it is itself the disclosure of an unverified claim (G-16)', () => {
  assert.doesNotThrow(() => gapSchema.parse({ text: es_en }));
});

test('`practice` is optional, but once present its shape is enforced', () => {
  const withPractice = {
    ...validStep,
    practice: { status: 'contradicted', by: 'a practitioner', at: '2026-01-01' },
  };
  assert.doesNotThrow(() => stepSchema.parse(withPractice));
  assert.throws(() =>
    stepSchema.parse({ ...validStep, practice: { status: 'contradicted' } }),
  );
});

test('`practice.status` covers confirmed/contradicted/unknown — the axis orthogonal to sourcing', () => {
  assert.deepEqual(
    claimFields.practice.unwrap().shape.status.options,
    ['confirmed', 'contradicted', 'unknown'],
  );
});

test('bilingual fields require both es and en', () => {
  assert.throws(() => bilingual.parse({ es: 'solo español' }));
  assert.doesNotThrow(() => bilingual.parse(es_en));
});
