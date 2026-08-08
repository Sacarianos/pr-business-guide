// Seam A (0001, "Seam A — the decision-tree module"): a pure function,
// answers plus content in, result out. No DOM, no network, no clock. Ports
// the design handoff's `build()`/`patente()` (design/handoff/Guia Negocios
// PR.dc.html) onto the repo's content/*.yaml — the branching rules are
// carried over from the handoff, but the copy and the sourcing marks now
// come from `content` instead of being inlined in this module.
//
// Every field this module returns is bilingual (`{ es, en }`), never
// pre-selected to one language. That is what makes the language toggle
// (G-19) free: switching `lang` never touches `answers`, and it never needs
// to re-run this module either — the caller just reads the other half of
// each bilingual field.
import type {
  Bilingual,
  EntityFormData,
  GapData,
  IncentiveData,
  MunicipioData,
  QuestionData,
  StepData,
} from './content-schema.ts';

export type Content = {
  steps: Record<string, StepData>;
  questions: (QuestionData & { id: string })[];
  municipios: Record<string, MunicipioData>;
  incentives: Record<string, IncentiveData>;
  gaps: (GapData & { id: string })[];
  // Standalone comparison content (G-12) — never read by buildSequence
  // below, same as `gaps`; carried on `Content` only so the page and
  // content.json (G-04) keep loading through the one shared path
  // load-content.ts exists to guarantee.
  entities: Record<string, EntityFormData>;
};

export type Answers = {
  type: 'retail' | 'food' | 'prof' | 'mfg' | null;
  entity: 'llc' | 'corp' | 'sole' | 'unsure' | null;
  premises: 'commercial' | 'home' | 'mobile' | null;
  buildout: 'yes' | 'no' | null;
  muni: string | null;
  vol: number | null;
  hiring: 'yes' | 'no' | null;
  driving: 'yes' | 'no' | null;
  exportsvc: 'yes' | 'no' | null;
  young: 'yes' | 'no' | null;
};

export function emptyAnswers(): Answers {
  return {
    type: null,
    entity: null,
    premises: null,
    buildout: null,
    muni: null,
    vol: null,
    hiring: null,
    driving: null,
    exportsvc: null,
    young: null,
  };
}

// `driving` only means anything once `hiring === 'yes'` — asking it
// otherwise is asking about a hire that was never made. This is the one
// branching rule between questions themselves, as opposed to between
// results; everything downstream of `answered()` depends on this filter
// running first, or a hidden `driving` answer would count toward the
// ≥3-question results threshold.
export function visibleQuestions(
  questions: Content['questions'],
  answers: Answers,
): Content['questions'] {
  return questions
    .filter((q) => q.id !== 'driving' || answers.hiring === 'yes')
    .sort((a, b) => a.order - b.order);
}

function isAnswered(answers: Answers, questionId: string): boolean {
  const value = answers[questionId as keyof Answers];
  return value !== null && value !== '' && !(typeof value === 'number' && Number.isNaN(value));
}

export function answeredCount(questions: Content['questions'], answers: Answers): number {
  return visibleQuestions(questions, answers).filter((q) => isAnswered(answers, q.id)).length;
}

// Results appear once ≥3 questions are answered — not on a fixed schedule,
// and not gated behind all 10 (design/handoff README, "Results assembly").
export function hasEnoughAnswers(questions: Content['questions'], answers: Answers): boolean {
  return answeredCount(questions, answers) >= 3;
}

export type PatenteEstimate = {
  amount: number;
  why: Bilingual;
  // Document provenance of the rate the estimate rests on, carried through
  // from the municipio. G-09 is explicit that rates which could not be
  // confirmed "must surface as uncertain rather than being rendered as
  // plain numbers", and the number itself is the place a reader is most
  // likely to take at face value — so the mark travels with it rather than
  // being left for the caller to look up. `primary` on the statewide
  // Art. 7.206 exemption, which rests on statute rather than on any
  // municipal ordinance.
  sourcing: MunicipioData['sourcing'];
};

const unconfirmedSuffix = (m: MunicipioData): Bilingual =>
  m.sourcing === 'primary'
    ? { es: '', en: '' }
    : {
        es: ' (tasa sin confirmar — ver la nota del municipio).',
        en: ' (unconfirmed rate — see the municipality note).',
      };

// The shared tail of every percentage-based bracket, flat or tiered: apply
// the rate, floor it at the municipio's statutory minimum, and say which
// rate was used. Only the wording differs between the two, so they share
// everything else rather than each carrying their own copy of the
// arithmetic.
function ratedEstimate(
  percent: number,
  volume: number,
  m: MunicipioData,
  bracket: 'flat' | 'tier',
): PatenteEstimate {
  const suffix = unconfirmedSuffix(m);
  const floor = m.minimum ?? 25;
  const pct = (percent * 100).toFixed(2);
  return {
    amount: Math.max(volume * percent, floor),
    sourcing: m.sourcing,
    why:
      bracket === 'flat'
        ? {
            es: `Tasa ${pct}% (mínimo $${floor}).${suffix.es}`,
            en: `Rate ${pct}% ($${floor} minimum).${suffix.en}`,
          }
        : {
            es: `Escalón de ${m.name}: ${pct}% (mínimo $${floor}).${suffix.es}`,
            en: `${m.name} tier: ${pct}% ($${floor} minimum).${suffix.en}`,
          },
  };
}

// Patente municipal estimator (G-09). Deliberately data-driven rather than
// a per-municipality switch: content/municipios.yaml already models every
// rate as `flat` or `tiered`, so one algorithm covers all ten rows and any
// future one added to the YAML needs no code change.
//
// Two per-municipality quirks the tiered data can't express with a bare
// `percent: 0` alone, both documented in municipios.yaml's header comment:
//   - a genuinely tax-free band (San Juan's first tier, ≤$12,500) — the
//     *first* tier in the array — pays $0.
//   - a flat-fee band disguised as a 0% tier (San Juan's second tier,
//     $12,501–$100,000) — any *later* tier at 0% pays the municipio's flat
//     minimum instead of $0.
// The two never collide in practice: the statewide Art. 7.206 exemption
// below (any volume ≤$5,000 is exempt everywhere) always intercepts first,
// which is also why Camuy's own ≤$5,000 tier — which its note says is
// really "$25 flat", not exempt — never has to be told apart from a true
// exemption; the statewide rule already answers $0 for that range either
// way.
export function patente(
  muniKey: string | null,
  volume: number | null,
  municipios: Content['municipios'],
): PatenteEstimate | null {
  if (volume == null || Number.isNaN(volume)) return null;

  if (volume <= 5000) {
    return {
      amount: 0,
      sourcing: 'primary',
      why: {
        es: 'Volumen ≤ $5,000 — exento por el Art. 7.206.',
        en: 'Volume ≤ $5,000 — exempt under Art. 7.206.',
      },
    };
  }

  if (!muniKey) return null;
  const m = municipios[muniKey];
  if (!m) return null;

  if (m.rate.type === 'flat') return ratedEstimate(m.rate.percent, volume, m, 'flat');

  const tiers = m.rate.tiers;
  const index = tiers.findIndex((t) => t.upTo === null || volume <= t.upTo);
  const tier = tiers[index === -1 ? tiers.length - 1 : index]!;

  if (tier.percent === 0) {
    const suffix = unconfirmedSuffix(m);
    if (index === 0) {
      return {
        amount: 0,
        sourcing: m.sourcing,
        why: {
          es: `${m.name} exime este volumen.`,
          en: `${m.name} exempts this volume.`,
        },
      };
    }
    const flat = m.minimum ?? 25;
    return {
      amount: flat,
      sourcing: m.sourcing,
      why: {
        es: `${m.name} cobra $${flat} fijos en este tramo.${suffix.es}`,
        en: `${m.name} charges a flat $${flat} in this bracket.${suffix.en}`,
      },
    };
  }

  return ratedEstimate(tier.percent, volume, m, 'tier');
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export type StepResult = StepData & { id: string };
export type IncentiveResult = IncentiveData & { id: string };

export type Result = {
  steps: StepResult[];
  incentives: IncentiveResult[];
  patente: PatenteEstimate | null;
  municipio: MunicipioData | null;
};

function step(content: Content, id: string): StepResult {
  const data = content.steps[id];
  if (!data) throw new Error(`decision-tree: unknown step id "${id}"`);
  return { id, ...data };
}

function incentive(content: Content, id: string): IncentiveResult {
  const data = content.incentives[id];
  if (!data) throw new Error(`decision-tree: unknown incentive id "${id}"`);
  return { id, ...data };
}

// The ordered list of step ids for a given answer set. Branching mirrors
// design/handoff's `build()`; cross-cutting warnings that in the handoff
// lived in a separate `warn[]` array are interleaved here instead, per the
// architecture decision recorded in content/steps.yaml's header comment
// (they're folded into the same `steps` collection, distinguished only by
// `severity`) — so this module returns one ordered sequence, not two lists.
function stepIds(answers: Answers, municipio: MunicipioData | null): string[] {
  const ids: string[] = [];

  if (answers.entity === 'sole') ids.push('entity-sole-proprietor');
  else if (answers.entity === 'llc') ids.push('entity-organize-llc', 'entity-llc-tax-classification');
  else if (answers.entity === 'corp') ids.push('entity-incorporate-corp');
  else if (answers.entity === 'unsure') ids.push('entity-undecided');

  ids.push('ein-federal', 'merchant-registration');

  if (answers.premises === 'commercial') {
    ids.push('zoning-verification');
    if (answers.buildout === 'yes') ids.push('construction-permit');
    ids.push('permiso-unico', 'reglamento-conjunto-legally-unstable', 'fire-inspection');
    if (answers.type === 'food') ids.push('sanitary-license', 'food-handler-certification');
  } else if (answers.premises === 'home') {
    ids.push('home-based-permiso-unico-question');
  } else if (answers.premises === 'mobile') {
    ids.push('provisional-patente-occasional-sales');
  }

  ids.push('patente-municipal');
  if (municipio && municipio.permits == null) ids.push('confirm-delegated-hierarchy');

  // The $50,000 CRIM exemption turns on net volume ≤$150,000, so above
  // that ceiling the reader gets the variant that says where they actually
  // stand rather than a conditional they have to evaluate themselves. With
  // volume unanswered the base entry is right: it states the test without
  // claiming the reader passes it.
  if (answers.type === 'retail' || answers.type === 'food' || answers.type === 'mfg') {
    ids.push(
      answers.vol != null && answers.vol > 150_000
        ? 'crim-personal-property-return-above-ceiling'
        : 'crim-personal-property-return',
    );
  }

  if (answers.vol != null && answers.vol > 3_000_000) ids.push('above-3m-obligations-change');

  if (answers.hiring === 'yes') {
    ids.push('employer-registration-dtrh', 'cfse-policy');
    if (answers.driving === 'yes') ids.push('drivers-social-security');
    ids.push(
      'new-hire-reporting-asume',
      'christmas-bonus-and-21-employee-cliff',
      'vacation-sick-leave-accrual',
    );
  } else if (answers.hiring === 'no') {
    ids.push('cfse-individual-track');
  }

  ids.push(answers.type === 'prof' ? 'ivu-monthly-b2b-professional' : 'ivu-monthly-general');

  ids.push('state-annual-fee-survives');

  return ids;
}

function incentiveIds(answers: Answers): string[] {
  const ids: string[] = ['first-semester-provisional-patente'];

  if (answers.type === 'prof' && (answers.entity === 'corp' || answers.entity === 'llc')) {
    ids.push('optional-tax-1022-07');
  }
  if (answers.young === 'yes') ids.push('young-entrepreneur-exemption');
  ids.push('pyme-120-2014-rates');
  if (answers.exportsvc === 'yes') ids.push('act60-export-services');
  else if (answers.exportsvc === 'no') ids.push('act60-not-applicable');
  if (answers.type === 'mfg') ids.push('pridco-industrial-space');
  ids.push('bde-technical-assistance');

  return ids;
}

// Fills in the two fields of the patente step that only become knowable
// once a municipality and a volume are on the table: the cost, which the
// content can only state as "by volume", and the agency, which the content
// can only call "the municipality" (story 10 asks for the ambiguity to be
// resolved, and `permits.delegated` is already loaded to resolve it).
//
// Both are plain bilingual data. The estimate's own prose (`why`), the
// municipio's note, and the unconfirmed-rate mark deliberately do *not*
// get spliced into `note` here — this module has no business emitting
// markup (0001 puts it behind Seam A: "no DOM"), and everything the
// renderer needs is already on `Result.patente` and `Result.municipio`.
function withPatenteEstimate(
  s: StepResult,
  estimate: PatenteEstimate | null,
  municipio: MunicipioData | null,
): StepResult {
  const agency = municipio
    ? {
        es: municipio.permits?.delegated
          ? `Municipio de ${municipio.name} (autoridad delegada)`
          : `Municipio de ${municipio.name}`,
        en: municipio.permits?.delegated
          ? `Municipality of ${municipio.name} (delegated authority)`
          : `Municipality of ${municipio.name}`,
      }
    : s.agency;

  if (!estimate) return { ...s, agency };

  return {
    ...s,
    agency,
    cost:
      estimate.amount === 0
        ? { es: '$0', en: '$0' }
        : {
            es: `${formatMoney(estimate.amount)}/año en estado estable`,
            en: `${formatMoney(estimate.amount)}/yr steady state`,
          },
  };
}

export function buildSequence(answers: Answers, content: Content): Result {
  const municipio = answers.muni ? (content.municipios[answers.muni] ?? null) : null;
  const estimate = patente(answers.muni, answers.vol, content.municipios);

  const steps = stepIds(answers, municipio).map((id) => {
    const s = step(content, id);
    return id === 'patente-municipal' ? withPatenteEstimate(s, estimate, municipio) : s;
  });

  const incentives = incentiveIds(answers).map((id) => incentive(content, id));

  return { steps, incentives, patente: estimate, municipio };
}
