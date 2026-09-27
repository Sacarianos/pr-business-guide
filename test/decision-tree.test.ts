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
  answersFromQuery,
  answersToQuery,
  buildSequence,
  emptyAnswers,
  groupByPhase,
  hasEnoughAnswers,
  stageBreakdown,
  patente,
  patenteLabel,
  routeHeading,
  routeSummary,
  SAMPLE_ANSWERS,
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
    assert.ok(ids.includes('crim-personal-property-return'), '$50k volume is under the CRIM ceiling');
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
    assert.ok(ids.includes('above-3m-obligations-change'));
    assert.ok(ids.includes('cfse-individual-track'));
    assert.ok(ids.includes('ivu-monthly-general'));

    // At $3.5M the $50,000 CRIM exemption is out of reach, so the reader
    // gets the variant that says so rather than the conditional one.
    assert.ok(ids.includes('crim-personal-property-return-above-ceiling'));
    assert.ok(!ids.includes('crim-personal-property-return'));
    const crim = r.steps.find((s) => s.id === 'crim-personal-property-return-above-ceiling')!;
    assert.match(crim.note.es, /sobre el techo de \$150,000/);
    assert.match(crim.note.en, /above the \$150,000 ceiling/);

    const incIds = incentiveIds(r);
    assert.ok(incIds.includes('act60-not-applicable'));
    assert.ok(!incIds.includes('pridco-industrial-space'), 'retail is not mfg');

    // Ponce is `secondary`-sourced — the estimate must carry that mark, in
    // the structured field as well as in the prose, so the UI can flag the
    // number itself rather than only the sentence under it (G-09).
    assert.equal(r.patente?.amount, Math.max(3_500_000 * 0.005, 25));
    assert.equal(r.patente?.sourcing, 'secondary');
    assert.match(r.patente!.why.es, /sin confirmar/);
    assert.match(r.patente!.why.en, /unconfirmed/);

    // Story 10: the agency is resolved from the municipality, not left as
    // the content's generic "Municipio".
    const patenteStep = r.steps.find((s) => s.id === 'patente-municipal')!;
    assert.match(patenteStep.agency.es, /Ponce/);
    assert.match(patenteStep.agency.en, /Ponce/);
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

  test('every estimate carries the sourcing of the rate it rests on', () => {
    // `other` is the statutory-ceiling fallback, not any real municipality's
    // confirmed rate — the loudest mark in the set, and the one most likely
    // to be mistaken for a real figure.
    assert.equal(patente('other', 20000, content.municipios)!.sourcing, 'unverified');
    assert.equal(patente('ponce', 20000, content.municipios)!.sourcing, 'secondary');
    assert.equal(patente('bayamon', 20000, content.municipios)!.sourcing, 'primary');
    // The statewide exemption rests on statute, not on any ordinance.
    assert.equal(patente('other', 1000, content.municipios)!.sourcing, 'primary');
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

  // Both the route's summary strip and the hero's sample card read this
  // label, so the three cases are pinned here once instead of in each
  // renderer. An exemption is the case that matters: "$0/año" would read as
  // a yearly charge rather than as "this one does not apply to you".
  test('patenteLabel() says "$0" for an exemption, never "$0/año"', () => {
    const exempt = patente('sanjuan', 5000, content.municipios);
    assert.deepEqual(patenteLabel(exempt), { es: '$0', en: '$0' });
  });

  test('patenteLabel() carries the period on a real charge and names the missing estimate', () => {
    const charged = patente('sanjuan', 120000, content.municipios);
    assert.deepEqual(patenteLabel(charged), { es: '$240/año', en: '$240/yr' });
    assert.deepEqual(patenteLabel(null), { es: 'Sin estimar', en: 'Not estimated' });
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

describe('stageBreakdown — the staged question flow (G-28)', () => {
  test('groups every visible question into an ascending, gapless set of stages', () => {
    const stages = stageBreakdown(content.questions, emptyAnswers());
    assert.deepEqual(
      stages.map((s) => s.stage),
      [1, 2, 3],
    );
    // Nothing is dropped or duplicated by the grouping.
    const grouped = stages.flatMap((s) => s.questions.map((q) => q.id)).sort();
    const visible = visibleQuestions(content.questions, emptyAnswers())
      .map((q) => q.id)
      .sort();
    assert.deepEqual(grouped, visible);
  });

  test('counts answered per stage, and marks a stage complete only when all of its questions are answered', () => {
    const partial = answers({ type: 'retail', entity: 'llc' });
    const [one] = stageBreakdown(content.questions, partial);
    assert.equal(one!.total, 4, 'stage 1 holds type, entity, premises, buildout');
    assert.equal(one!.answered, 2);
    assert.equal(one!.complete, false);

    const full = answers({ type: 'retail', entity: 'llc', premises: 'home', buildout: 'no' });
    const [oneFull] = stageBreakdown(content.questions, full);
    assert.equal(oneFull!.answered, 4);
    assert.equal(oneFull!.complete, true);
  });

  test('`driving` leaves stage 3 entirely while hiring is not yes, so the stage can complete without it', () => {
    const notHiring = answers({ hiring: 'no', exportsvc: 'no', young: 'no' });
    const three = stageBreakdown(content.questions, notHiring).find((s) => s.stage === 3)!;
    assert.ok(
      !three.questions.some((q) => q.id === 'driving'),
      'driving is not merely hidden — it is absent from the stage',
    );
    assert.equal(three.total, 3, 'hiring, exportsvc, young');
    assert.equal(three.complete, true, 'stage completes without an answer never shown');

    // Answering hiring=yes pulls driving back into the stage and re-opens it.
    const hiring = answers({ hiring: 'yes', exportsvc: 'no', young: 'no' });
    const threeHiring = stageBreakdown(content.questions, hiring).find((s) => s.stage === 3)!;
    assert.equal(threeHiring.total, 4);
    assert.equal(threeHiring.complete, false);
  });
});

describe('route phases in the content (0002, G-30)', () => {
  const PHASES: Record<string, string[]> = {
    formation: [
      'entity-sole-proprietor', 'entity-organize-llc', 'entity-llc-tax-classification',
      'entity-incorporate-corp', 'entity-undecided', 'ein-federal', 'merchant-registration',
    ],
    premises: ['zoning-verification', 'construction-permit'],
    operate: [
      'permiso-unico', 'reglamento-conjunto-legally-unstable', 'fire-inspection', 'sanitary-license',
      'food-handler-certification', 'home-based-permiso-unico-question',
      'provisional-patente-occasional-sales', 'confirm-delegated-hierarchy', 'above-3m-obligations-change',
    ],
    people: [
      'employer-registration-dtrh', 'cfse-policy', 'cfse-individual-track', 'drivers-social-security',
      'new-hire-reporting-asume', 'christmas-bonus-and-21-employee-cliff', 'vacation-sick-leave-accrual',
    ],
    recurring: [
      'patente-municipal', 'crim-personal-property-return', 'crim-personal-property-return-above-ceiling',
      'ivu-monthly-general', 'ivu-monthly-b2b-professional', 'state-annual-fee-survives',
    ],
  };
  const ADVISORIES = [
    'entity-undecided', 'reglamento-conjunto-legally-unstable', 'confirm-delegated-hierarchy',
    'above-3m-obligations-change', 'christmas-bonus-and-21-employee-cliff', 'vacation-sick-leave-accrual',
  ];

  test('the phase collection holds exactly the five phases, in order', () => {
    const phases = content.phases;
    const ids = (Object.keys(phases) as (keyof typeof phases)[]).sort((a, b) => phases[a].order - phases[b].order);
    assert.deepEqual(ids, ['formation', 'premises', 'operate', 'people', 'recurring']);
  });

  for (const [phase, ids] of Object.entries(PHASES)) {
    test(`the ${phase} phase holds exactly its assigned steps`, () => {
      const actual = Object.entries(content.steps).filter(([, s]) => s.phase === phase).map(([id]) => id);
      assert.deepEqual(actual.sort(), [...ids].sort());
    });
  }

  test('a step is in the recurring phase exactly when it is recurring', () => {
    for (const [id, s] of Object.entries(content.steps)) {
      assert.equal(s.phase === 'recurring', s.recurring, `${id}: phase ${s.phase}, recurring ${s.recurring}`);
    }
  });

  test('exactly the listed steps are advisories', () => {
    const actual = Object.entries(content.steps).filter(([, s]) => s.kind === 'advisory').map(([id]) => id);
    assert.deepEqual(actual.sort(), [...ADVISORIES].sort());
  });
});

describe('groupByPhase and routeSummary (0002, G-30)', () => {
  const sample = buildSequence(SAMPLE_ANSWERS, content);
  const groups = groupByPhase(sample, content);

  test('the sample route fills all five phases, in order', () => {
    assert.deepEqual(groups.map((g) => g.phase), ['formation', 'premises', 'operate', 'people', 'recurring']);
    assert.equal(groups[0]!.title.es, 'Forma el negocio');
  });

  test('actions, advisories and recurring stops land in the expected phases', () => {
    const count = (kind: string) => groups.map((g) => g.stops.filter((s) => s.kind === kind && !s.recurring).length);
    assert.deepEqual(count('action'), [4, 1, 4, 3, 0]);
    assert.deepEqual(count('advisory'), [0, 0, 1, 2, 0]);
    assert.equal(groups[4]!.stops.length, 4);
  });

  test('one-time actions are numbered 1 to 12 across phases; advisories and recurring stops are unnumbered', () => {
    const stops = groups.flatMap((g) => g.stops);
    const numbered = stops.filter((s) => s.number !== null).map((s) => s.number);
    assert.deepEqual(numbered, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const s of stops) {
      if (s.kind === 'advisory' || s.recurring) assert.equal(s.number, null, `${s.id} should be unnumbered`);
    }
  });

  test('stops keep their buildSequence order within each phase', () => {
    const position = new Map(sample.steps.map((s, i) => [s.id, i]));
    for (const g of groups) {
      const positions = g.stops.map((s) => position.get(s.id)!);
      assert.deepEqual(positions, [...positions].sort((a, b) => a - b), `${g.phase} is out of order`);
    }
  });

  test('every step of the sequence appears exactly once across the groups', () => {
    assert.deepEqual(groups.flatMap((g) => g.stops.map((s) => s.id)).sort(), stepIds(sample).sort());
  });

  test('a phase with no stops is omitted: the home-based scenario has no premises phase', () => {
    const r = buildSequence(
      answers({ type: 'prof', entity: 'sole', premises: 'home', vol: 3000, hiring: 'no', exportsvc: 'no', young: 'no' }),
      content,
    );
    assert.ok(!groupByPhase(r, content).some((g) => g.phase === 'premises'));
  });

  test('routeSummary counts 12 one-time procedures, 4 recurring duties, and a $240 patente', () => {
    const summary = routeSummary(sample);
    assert.equal(summary.steps, 12);
    assert.equal(summary.recurring, 4);
    assert.equal(summary.patente?.amount, 240);
  });
});

describe('routeHeading (0002, G-34)', () => {
  test('the sample route is headed by its business type, with municipio and legal form under it', () => {
    const h = routeHeading(SAMPLE_ANSWERS, content);
    assert.deepEqual(h.title, { es: 'Restaurante / cafetería', en: 'Restaurant / café' });
    assert.deepEqual(h.subline, { es: 'San Juan · LLC', en: 'San Juan · LLC' });
  });

  test('an undecided legal form and no municipio read as "forma legal por decidir"', () => {
    const h = routeHeading(answers({ type: 'retail', entity: 'unsure' }), content);
    assert.deepEqual(h.subline, { es: 'forma legal por decidir', en: 'legal form undecided' });
  });

  test('with nothing answered the title is generic and the subline empty', () => {
    const h = routeHeading(emptyAnswers(), content);
    assert.deepEqual(h.title, { es: 'Tu negocio', en: 'Your business' });
    assert.deepEqual(h.subline, { es: '', en: '' });
  });
});

describe('incentive law and titles (0002, G-36)', () => {
  const EXPECTED: Record<string, [string | undefined, string]> = {
    'first-semester-provisional-patente': ['Art. 7.210', 'Patente provisional del primer semestre'],
    'optional-tax-1022-07': ['§1022.07', 'Contribución opcional, 6% del bruto'],
    'young-entrepreneur-exemption': [undefined, 'Joven empresario, exención sobre los primeros $500,000'],
    'pyme-120-2014-rates': ['Ley 120-2014', 'Tasas PYME de 5%, 10% y 15%'],
    'act60-export-services': ['Ley 60 Cap. 3', 'Exportación de servicios, 4% fijo'],
    'act60-not-applicable': [undefined, 'La Ley 60 no aplica, y conviene saberlo ya'],
    'pridco-industrial-space': [undefined, 'PRIDCO, espacio industrial ya zonificado'],
    'bde-technical-assistance': [undefined, 'BDE y la asistencia técnica gratuita que casi nadie usa'],
  };

  test('each incentive carries the law and Spanish title from the spec', () => {
    assert.deepEqual(Object.keys(content.incentives).sort(), Object.keys(EXPECTED).sort());
    for (const [id, [law, title]] of Object.entries(EXPECTED)) {
      assert.equal(content.incentives[id]!.law, law, `${id} law`);
      assert.equal(content.incentives[id]!.title.es, title, `${id} title`);
    }
  });

  test('no incentive title in either language keeps the old dash', () => {
    for (const [id, inc] of Object.entries(content.incentives)) {
      assert.ok(!inc.title.es.includes('—') && !inc.title.en.includes('—'), id);
    }
  });
});

describe('answers in the URL (0002, G-31)', () => {
  const Q =
    'type=food&entity=llc&premises=commercial&buildout=no&muni=sanjuan&vol=120000&hiring=yes&driving=no&exportsvc=no&young=no';

  test('no answers make an empty query', () => {
    assert.equal(answersToQuery(emptyAnswers(), content.questions), '');
  });

  test('the sample answers make the spec query exactly, in question order', () => {
    assert.equal(answersToQuery(SAMPLE_ANSWERS, content.questions), Q);
  });

  test('encoding then decoding gives back the same answers', () => {
    const sets: Answers[] = [
      SAMPLE_ANSWERS,
      answers({ type: 'prof', entity: 'sole', premises: 'home', vol: 3000, hiring: 'no', exportsvc: 'no', young: 'no' }),
      answers({ type: 'food', entity: 'llc', premises: 'commercial', buildout: 'yes', hiring: 'yes', driving: 'yes', muni: 'sanjuan', vol: 80000 }),
      answers({ type: 'retail', entity: 'corp', premises: 'commercial', buildout: 'no', hiring: 'no', muni: 'ponce', vol: 600000 }),
      answers({ type: 'mfg', entity: 'unsure', premises: 'mobile', muni: 'camuy', vol: 4000 }),
      answers({ type: 'retail', entity: 'llc', premises: 'commercial', muni: 'other', vol: 50000 }),
      answers({ type: 'prof', entity: 'llc', premises: 'home' }),
      answers({ hiring: 'yes', driving: 'no' }),
    ];
    for (const a of sets) {
      assert.deepEqual(answersFromQuery(answersToQuery(a, content.questions), content.questions), a);
    }
  });

  test('a leading question mark is accepted', () => {
    assert.deepEqual(answersFromQuery(`?${Q}`, content.questions), SAMPLE_ANSWERS);
  });

  test('unknown keys and values outside a question\'s options are dropped', () => {
    assert.deepEqual(
      answersFromQuery('type=spaceship&muni=sanjuan&foo=1', content.questions),
      answers({ muni: 'sanjuan' }),
    );
    assert.equal(answersFromQuery('muni=atlantis', content.questions).muni, null);
  });

  test('vol must be a finite number of at least zero', () => {
    for (const bad of ['vol=-5', 'vol=abc', 'vol=', 'vol=Infinity', 'vol=%20']) {
      assert.equal(answersFromQuery(bad, content.questions).vol, null, bad);
    }
    assert.equal(answersFromQuery('vol=120000', content.questions).vol, 120000);
    assert.equal(answersFromQuery('vol=0', content.questions).vol, 0);
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
