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
  questionSchema,
  municipioSchema,
  incentiveSchema,
  gapSchema,
  entityFormSchema,
  phaseSchema,
} from '../src/lib/content-schema.ts';

const es_en = { es: 'es', en: 'en' };

const validStep = {
  title: es_en,
  agency: es_en,
  timing: es_en,
  cost: es_en,
  note: es_en,
  phase: 'formation',
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

const validEntity = {
  order: 1,
  name: es_en,
  liability: es_en,
  filing: es_en,
  defaultTax: es_en,
  formationCost: es_en,
  annualObligation: es_en,
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

test('an entity form missing `sourcing` fails validation', () => {
  const { sourcing, ...withoutSourcing } = validEntity;
  assert.throws(() => entityFormSchema.parse(withoutSourcing));
  assert.doesNotThrow(() => entityFormSchema.parse(validEntity));
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

test('`professional` is optional and, when present, is either cpa or attorney (G-18)', () => {
  assert.doesNotThrow(() => stepSchema.parse(validStep));
  assert.equal(stepSchema.parse(validStep).professional, undefined);
  assert.doesNotThrow(() => stepSchema.parse({ ...validStep, professional: 'cpa' }));
  assert.doesNotThrow(() => incentiveSchema.parse({ ...validIncentive, professional: 'attorney' }));
  assert.doesNotThrow(() => entityFormSchema.parse({ ...validEntity, professional: 'cpa' }));
  assert.throws(() => stepSchema.parse({ ...validStep, professional: 'notary' }));
});

test('a question carries optional `help` and per-option `detail`, both bilingual (G-27)', () => {
  const bare = {
    order: 1,
    label: es_en,
    input: 'options',
    options: [{ value: 'llc', label: es_en }],
  };
  // Both are additive: every question written before G-27 still parses.
  assert.doesNotThrow(() => questionSchema.parse(bare));
  assert.equal(questionSchema.parse(bare).help, undefined);

  assert.doesNotThrow(() =>
    questionSchema.parse({
      ...bare,
      help: { summary: es_en, body: es_en },
      options: [{ value: 'llc', label: es_en, detail: es_en }],
    }),
  );

  // A half-written explainer fails loudly rather than rendering a blank
  // expander — same reason `bilingual` requires both keys everywhere else.
  assert.throws(() => questionSchema.parse({ ...bare, help: { summary: es_en } }));
  assert.throws(() =>
    questionSchema.parse({ ...bare, help: { summary: { es: 'solo' }, body: es_en } }),
  );
});

test('a step must name one of the five phases (0002, G-30)', () => {
  const { phase: _, ...noPhase } = validStep;
  assert.throws(() => stepSchema.parse(noPhase));
  assert.throws(() => stepSchema.parse({ ...validStep, phase: 'someday' }));
  for (const phase of ['formation', 'premises', 'operate', 'people', 'recurring']) {
    assert.doesNotThrow(() => stepSchema.parse({ ...validStep, phase }));
  }
});

test('`kind` is action or advisory, and defaults to action (0002, G-30)', () => {
  assert.equal(stepSchema.parse(validStep).kind, 'action');
  assert.equal(stepSchema.parse({ ...validStep, kind: 'advisory' }).kind, 'advisory');
  assert.throws(() => stepSchema.parse({ ...validStep, kind: 'decision' }));
});

test('a phase carries an integer order and a bilingual title (0002, G-30)', () => {
  assert.doesNotThrow(() => phaseSchema.parse({ order: 1, title: es_en }));
  assert.throws(() => phaseSchema.parse({ order: 1.5, title: es_en }));
  assert.throws(() => phaseSchema.parse({ order: 1, title: { es: 'solo' } }));
});

test('an incentive may name the law that creates it, as plain text (0002, G-36)', () => {
  assert.equal(incentiveSchema.parse(validIncentive).law, undefined);
  assert.equal(incentiveSchema.parse({ ...validIncentive, law: 'Art. 7.210' }).law, 'Art. 7.210');
  assert.throws(() => incentiveSchema.parse({ ...validIncentive, law: es_en }));
});

test('bilingual fields require both es and en', () => {
  assert.throws(() => bilingual.parse({ es: 'solo español' }));
  assert.doesNotThrow(() => bilingual.parse(es_en));
});
