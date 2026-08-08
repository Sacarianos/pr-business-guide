// G-07: Node test suite over the decision-tree module (G-06). Per 0001
// ("tests feed the real built content.json into Seam A as a fixture, so
// the build is validated by being used"), this suite does not construct
// its own fixture content — `pretest` runs `astro build` first (see
// package.json) and this file loads the resulting dist/content.json,
// exactly the artifact G-04 publishes and cud-agente fetches.
//
// Coverage mirrors what 0001 says survived from the prior artifact: seven
// scenarios exercising the branching, plus bilingual dictionary key parity
// and cross-language leakage checks — run here against real content rather
// than a hand-maintained fixture.
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, describe } from 'node:test';
import {
  answeredCount,
  buildSequence,
  emptyAnswers,
  hasEnoughAnswers,
  patente,
  visibleQuestions,
  type Answers,
  type Content,
} from '../src/lib/decision-tree.ts';

const contentPath = join(import.meta.dirname, '..', 'dist', 'content.json');
let content: Content;
try {
  content = JSON.parse(readFileSync(contentPath, 'utf8'));
} catch {
  throw new Error(
    `dist/content.json not found at ${contentPath} — run \`npm run build\` first ` +
      `(this is exactly what the \`pretest\` script does for \`npm test\`).`,
  );
}

function answers(overrides: Partial<Answers>): Answers {
  return { ...emptyAnswers(), ...overrides };
}

function stepIds(result: ReturnType<typeof buildSequence>): string[] {
  return result.steps.map((s) => s.id);
}

function incentiveIds(result: ReturnType<typeof buildSequence>): string[] {
  return result.incentives.map((s) => s.id);
}

describe('seven scenarios', () => {
  test('1. sole proprietor, professional services, home, no hires, low volume — exempt patente', () => {
    const r = buildSequence(
      answers({
        type: 'prof',
        entity: 'sole',
        premises: 'home',
        vol: 3000,
        hiring: 'no',
        exportsvc: 'no',
        young: 'no',
      }),
      content,
    );
    const ids = stepIds(r);
    assert.ok(ids.includes('entity-sole-proprietor'));
    assert.ok(ids.includes('home-based-permiso-unico-question'));
    assert.ok(ids.includes('cfse-individual-track'));
    assert.ok(ids.includes('ivu-monthly-b2b-professional'));
    assert.ok(!ids.includes('crim-personal-property-return'), 'prof is not retail/food/mfg');
    assert.ok(!ids.includes('employer-registration-dtrh'), 'not hiring');
    assert.ok(!ids.includes('zoning-verification'), 'not commercial premises');

    const incIds = incentiveIds(r);
    assert.ok(incIds.includes('act60-not-applicable'));
    assert.ok(!incIds.includes('optional-tax-1022-07'), 'sole proprietor, not corp/llc');
    assert.ok(!incIds.includes('young-entrepreneur-exemption'));

    assert.equal(r.patente?.amount, 0, 'volume <= $5,000 is exempt under Art. 7.206');
  });

  test('2. LLC, food, commercial + buildout, hiring + driving, San Juan flat-$25 band', () => {
    const r = buildSequence(
      answers({
        type: 'food',
        entity: 'llc',
        premises: 'commercial',
        buildout: 'yes',
        muni: 'sanjuan',
        vol: 50000,
        hiring: 'yes',
        driving: 'yes',
        exportsvc: 'yes',
        young: 'yes',
      }),
      content,
    );
    const ids = stepIds(r);
    assert.ok(ids.includes('entity-organize-llc'));
    assert.ok(ids.includes('entity-llc-tax-classification'));
    assert.ok(ids.includes('construction-permit'));
    assert.ok(ids.includes('permiso-unico'));
    assert.ok(ids.includes('reglamento-conjunto-legally-unstable'));
    assert.ok(ids.includes('sanitary-license'));
    assert.ok(ids.includes('food-handler-certification'));
    assert.ok(ids.includes('crim-personal-property-return'));
    assert.ok(ids.includes('drivers-social-security'), 'driving === yes');
    assert.ok(ids.includes('christmas-bonus-and-21-employee-cliff'));
    assert.ok(ids.includes('vacation-sick-leave-accrual'));
    assert.ok(ids.includes('ivu-monthly-general'), 'food is not prof');
    assert.ok(!ids.includes('confirm-delegated-hierarchy'), "San Juan's delegation is known");

    const incIds = incentiveIds(r);
    assert.ok(incIds.includes('young-entrepreneur-exemption'));
    assert.ok(incIds.includes('act60-export-services'));
    assert.ok(!incIds.includes('optional-tax-1022-07'), 'food is not prof');

    // 12,501 - 100,000 is San Juan's flat-$25 band, encoded as a 0% tier
    // that is NOT the first tier — see decision-tree.ts's patente() note.
    assert.equal(r.patente?.amount, 25);
  });

  test('3. corp, retail, commercial (no buildout), no hires, Ponce > 500k crosses the $3M line', () => {
    const r = buildSequence(
      answers({
        type: 'retail',
        entity: 'corp',
        premises: 'commercial',
        buildout: 'no',
        muni: 'ponce',
        vol: 3_500_000,
        hiring: 'no',
        exportsvc: 'no',
        young: 'no',
      }),
      content,
    );
    const ids = stepIds(r);
    assert.ok(ids.includes('entity-incorporate-corp'));
    assert.ok(!ids.includes('construction-permit'), 'buildout === no');
    assert.ok(ids.includes('crim-personal-property-return'));
    assert.ok(ids.includes('above-3m-obligations-change'));
    assert.ok(ids.includes('cfse-individual-track'));
    assert.ok(ids.includes('ivu-monthly-general'));

    const incIds = incentiveIds(r);
    assert.ok(incIds.includes('act60-not-applicable'));
    assert.ok(!incIds.includes('pridco-industrial-space'), 'retail is not mfg');

    // Ponce is `secondary`-sourced — the estimate must say so.
    assert.equal(r.patente?.amount, Math.max(3_500_000 * 0.005, 25));
    assert.match(r.patente!.why.es, /sin confirmar/);
    assert.match(r.patente!.why.en, /unconfirmed/);
  });

  test('4. mfg, undecided entity, mobile premises, Camuy under the statewide $5,000 floor', () => {
    const r = buildSequence(
      answers({
        type: 'mfg',
        entity: 'unsure',
        premises: 'mobile',
        muni: 'camuy',
        vol: 4000,
        hiring: 'no',
      }),
      content,
    );
    const ids = stepIds(r);
    assert.ok(ids.includes('entity-undecided'));
    assert.ok(ids.includes('provisional-patente-occasional-sales'));
    assert.ok(ids.includes('crim-personal-property-return'));
    assert.ok(!ids.includes('confirm-delegated-hierarchy'), "Camuy's delegation is known (false)");

    const incIds = incentiveIds(r);
    assert.ok(incIds.includes('pridco-industrial-space'));
    assert.ok(!incIds.includes('act60-export-services'));
    assert.ok(!incIds.includes('act60-not-applicable'), 'exportsvc left unanswered');

    // Camuy's own note: under $5,000 its real charge is a flat $25, but the
    // statewide exemption always intercepts first, so the estimate is $0.
    assert.equal(r.patente?.amount, 0);
  });

  test('5. LLC, retail, commercial, "other" municipality — delegation unknown, rate unconfirmed', () => {
    const r = buildSequence(
      answers({
        type: 'retail',
        entity: 'llc',
        premises: 'commercial',
        buildout: 'no',
        muni: 'other',
        vol: 20000,
        hiring: 'yes',
        driving: 'no',
        exportsvc: 'yes',
      }),
      content,
    );
    const ids = stepIds(r);
    assert.ok(ids.includes('confirm-delegated-hierarchy'), '"other" carries no `permits` field');
    assert.ok(!ids.includes('drivers-social-security'), 'driving === no');
    assert.ok(ids.includes('employer-registration-dtrh'));

    assert.equal(r.patente?.amount, Math.max(20000 * 0.005, 25));
    assert.match(r.patente!.why.es, /sin confirmar/);
  });

  test('6. professional LLC, home, no municipality answered — patente is unknown, not zero', () => {
    const r = buildSequence(
      answers({
        type: 'prof',
        entity: 'llc',
        premises: 'home',
        vol: 80000,
        hiring: 'no',
        exportsvc: 'yes',
        young: 'yes',
      }),
      content,
    );
    const incIds = incentiveIds(r);
    assert.ok(incIds.includes('optional-tax-1022-07'), 'prof + llc qualifies');
    assert.ok(incIds.includes('young-entrepreneur-exemption'));
    assert.ok(incIds.includes('act60-export-services'));

    assert.equal(r.patente, null, 'no municipality answered — an estimate would be a guess');
    const patenteStep = r.steps.find((s) => s.id === 'patente-municipal')!;
    assert.equal(patenteStep.cost.es, 'Según volumen', 'falls back to the unestimated content copy');
  });

  test('7. hiring with no driving — the driving-specific step and question are both absent', () => {
    const qs = content.questions;
    const notHiring = answers({ type: 'retail', entity: 'sole', premises: 'home', hiring: 'no' });
    assert.ok(
      !visibleQuestions(qs, notHiring).some((q) => q.id === 'driving'),
      'driving is only visible once hiring === yes',
    );

    const hiringNoDriving = { ...notHiring, hiring: 'yes' as const, driving: 'no' as const };
    assert.ok(
      visibleQuestions(qs, hiringNoDriving).some((q) => q.id === 'driving'),
      'driving becomes visible once hiring === yes',
    );
    const r = buildSequence(hiringNoDriving, content);
    assert.ok(!stepIds(r).includes('drivers-social-security'));
  });
});

describe('patente() — tier and boundary behavior', () => {
  test('returns null with no volume, no municipality, or an unknown municipality', () => {
    assert.equal(patente('sanjuan', null, content.municipios), null);
    assert.equal(patente('sanjuan', Number.NaN, content.municipios), null);
    assert.equal(patente(null, 20000, content.municipios), null);
    assert.equal(patente('atlantis', 20000, content.municipios), null);
  });

  test('the statewide $5,000 exemption applies at the boundary regardless of municipality', () => {
    assert.equal(patente('sanjuan', 5000, content.municipios)!.amount, 0);
    assert.equal(patente('bayamon', 5000, content.municipios)!.amount, 0);
  });

  test("San Juan's own exemption extends to $12,500, past the statewide floor", () => {
    assert.equal(patente('sanjuan', 12500, content.municipios)!.amount, 0);
    assert.equal(patente('sanjuan', 12501, content.municipios)!.amount, 25);
  });

  test("San Juan's flat-$25 band holds through $100,000, then the 0.20% tier begins", () => {
    assert.equal(patente('sanjuan', 100000, content.municipios)!.amount, 25);
    assert.equal(patente('sanjuan', 100001, content.municipios)!.amount, Math.max(100001 * 0.002, 25));
    assert.equal(patente('sanjuan', 300001, content.municipios)!.amount, Math.max(300001 * 0.005, 25));
  });

  test('flat-rate municipalities apply their percentage against the statutory $25 floor', () => {
    assert.equal(patente('bayamon', 6000, content.municipios)!.amount, 30);
    assert.equal(patente('bayamon', 1000, content.municipios)!.amount, 0, 'still under $5,000');
  });
});

describe('question gating and the results threshold', () => {
  test('fewer than 3 answers means no results yet', () => {
    const a = answers({ type: 'retail', entity: 'sole' });
    assert.equal(answeredCount(content.questions, a), 2);
    assert.equal(hasEnoughAnswers(content.questions, a), false);
  });

  test('3 answers is enough, without needing all 10', () => {
    const a = answers({ type: 'retail', entity: 'sole', premises: 'home' });
    assert.equal(answeredCount(content.questions, a), 3);
    assert.equal(hasEnoughAnswers(content.questions, a), true);
  });

  test('an answered `driving` does not count while `hiring` is not yes', () => {
    const a = answers({ type: 'retail', entity: 'sole', driving: 'yes' });
    assert.equal(answeredCount(content.questions, a), 2, 'driving is hidden, so it does not count');
  });
});

describe('bilingual dictionary key parity and cross-language leakage', () => {
  // Spanish-only orthography that must never appear in an `en` field, and a
  // curated list of unambiguous Spanish stopwords with no English homograph
  // — both catch a paragraph pasted into the wrong language slot without
  // flagging the many Spanish program names (e.g. "Permiso Único") this
  // content deliberately keeps untranslated inside English copy.
  const spanishOnlyChars = /[¿¡]/;
  const spanishStopwords =
    /\b(según|también|además|aunque|porque|todavía|tampoco|radica|radicar|cobra|dentro de|mediante|así que)\b/i;
  const englishStopwords = /\b(the|and|within|without|however|therefore)\b/i;

  function walk(node: unknown, path: string, assertOne: (es: string, en: string, path: string) => void) {
    if (node === null || typeof node !== 'object') return;
    if (
      'es' in (node as Record<string, unknown>) &&
      'en' in (node as Record<string, unknown>) &&
      typeof (node as Record<string, unknown>).es === 'string' &&
      typeof (node as Record<string, unknown>).en === 'string' &&
      Object.keys(node as Record<string, unknown>).length === 2
    ) {
      const { es, en } = node as Record<string, string>;
      assertOne(es, en, path);
      return;
    }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      walk(value, `${path}.${key}`, assertOne);
    }
  }

  test('every bilingual field has both an es and an en key populated', () => {
    // Not a translation-quality check — short fields (agency: "—", cost:
    // "$0", a bare portal domain) legitimately match across languages, so
    // this only asserts the key-parity part: both keys exist, both are
    // non-empty. Leakage (wrong language in the wrong slot) is checked
    // separately below.
    let checked = 0;
    walk(content, 'content', (es, en, path) => {
      checked++;
      assert.ok(es.trim().length > 0, `${path}.es is empty`);
      assert.ok(en.trim().length > 0, `${path}.en is empty`);
    });
    assert.ok(checked > 50, `expected many bilingual fields across content, only found ${checked}`);
  });

  test('no Spanish-only orthography or stopwords leak into `en` fields', () => {
    walk(content, 'content', (_es, en, path) => {
      assert.ok(!spanishOnlyChars.test(en), `${path}.en contains ¿/¡: "${en}"`);
      assert.ok(!spanishStopwords.test(en), `${path}.en contains a Spanish stopword: "${en}"`);
    });
  });

  test('no bare English stopwords leak into `es` fields', () => {
    walk(content, 'content', (es, _en, path) => {
      assert.ok(!englishStopwords.test(es), `${path}.es contains an English stopword: "${es}"`);
    });
  });
});
