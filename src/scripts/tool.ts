// Client-side glue for the ten-question flow (G-08). Deliberately vanilla —
// no framework, per the "zero JavaScript by default" principle (0001): the
// question panel is the one part of the page that has to be interactive,
// so it is a small hand-written island rather than pulling in Preact for a
// form. All the actual logic (branching, patente arithmetic) comes from
// decision-tree.ts (G-06) unchanged — this file only wires DOM events to
// it and renders the result.
//
// G-19: this island owns its own language switching rather than the
// `[lang]`/CSS-toggle technique src/pages/index.astro's static sections
// use. Two reasons: a `<select><option>`'s text and an `aria-label`
// attribute can't hold a hidden alternate-language span, and this module
// already regenerates its results HTML on every answer change — so
// re-rendering in a different language on `langchange` costs nothing extra.
import {
  buildSequence,
  emptyAnswers,
  formatMoney,
  hasEnoughAnswers,
  partitionRecurring,
  stageBreakdown,
  type Answers,
  type Content,
  type StepResult,
} from '../lib/decision-tree.ts';
import {
  practiceAttribution,
  practiceHeadline,
  professionalLabel,
  sourcingLabel,
} from '../lib/sourcing-label.ts';
import { currentLang, type Lang } from './lang-toggle.ts';

const dataEl = document.getElementById('tool-content');
if (!dataEl?.textContent) throw new Error('tool.ts: #tool-content is missing');
const content: Content = JSON.parse(dataEl.textContent);

const questionsEl = document.querySelector<HTMLElement>('[data-questions]');
const emptyStateEl = document.querySelector<HTMLElement>('[data-empty-state]');
const resultsEl = document.querySelector<HTMLElement>('[data-results]');
const glanceEl = document.querySelector<HTMLElement>('[data-glance]');
const sequenceEl = document.querySelector<HTMLElement>('[data-sequence]');
const recurringEl = document.querySelector<HTMLElement>('[data-recurring]');
const incentivesEl = document.querySelector<HTMLElement>('[data-incentives]');
const startOverBtn = document.querySelector<HTMLButtonElement>('[data-start-over]');
const railEl = document.querySelector<HTMLElement>('[data-stage-rail]');
const prevBtn = document.querySelector<HTMLButtonElement>('[data-stage-prev]');
const nextBtn = document.querySelector<HTMLButtonElement>('[data-stage-next]');

if (
  !questionsEl ||
  !emptyStateEl ||
  !resultsEl ||
  !glanceEl ||
  !sequenceEl ||
  !recurringEl ||
  !incentivesEl
) {
  throw new Error('tool.ts: expected page markup is missing');
}

let answers: Answers = emptyAnswers();
let lang: Lang = currentLang();
// Which stage the reader is on (G-28). Clamped in showStage() rather than
// tracked as an index into a fixed list, since `driving` entering or
// leaving stage 3 changes what stageBreakdown() returns between renders.
let stage = 1;

// The static strings this island renders that don't come from `content`
// (which is already bilingual — see decision-tree.ts). Keyed the same way
// as the `data-i18n` attributes src/pages/index.astro marks their elements
// with, so applyStaticText() below can drive both from one lookup.
const UI_TEXT: Record<string, Record<Lang, string>> = {
  startOver: { es: 'Empezar de nuevo', en: 'Start over' },
  emptyState: {
    es: 'Contesta al menos tres preguntas para ver tu secuencia.',
    en: 'Answer at least three questions to see your sequence.',
  },
  sequenceTitle: { es: 'Tu secuencia', en: 'Your sequence' },
  recurringTitle: { es: 'Obligaciones recurrentes', en: 'Recurring obligations' },
  recurringDek: {
    es: 'Estas no son pasos de una sola vez — siguen viniendo mientras el negocio esté abierto, cada una con su propia frecuencia.',
    en: 'These aren\'t one-time steps — they keep coming as long as the business is open, each on its own schedule.',
  },
  incentivesTitle: { es: 'Incentivos aplicables', en: 'Applicable incentives' },
  glanceSteps: { es: 'Pasos en tu secuencia', en: 'Steps in your sequence' },
  glanceIncentives: { es: 'Incentivos aplicables', en: 'Applicable incentives' },
  glancePatente: { es: 'Patente estimada', en: 'Estimated patente' },
  blocks: { es: 'Bloquea', en: 'Blocks' },
  consult: { es: 'Consulta con', en: 'Talk to' },
  stagePrev: { es: 'Atrás', en: 'Back' },
  stageNext: { es: 'Siguiente', en: 'Next' },
};

// Stage names are UI chrome, not content — they describe how the form is
// grouped, not anything about Puerto Rico's law — so they live here rather
// than in content/*.yaml and stay out of the agent's corpus. Keyed by
// stage number; a stage with no entry falls back to a bare number.
const STAGE_NAMES: Record<number, Record<Lang, string>> = {
  1: { es: 'Tu negocio', en: 'Your business' },
  2: { es: 'Dónde y cuánto', en: 'Where and how much' },
  3: { es: 'Gente e incentivos', en: 'People and incentives' },
};

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function readAnswer(id: string): string | number | null {
  return (answers as unknown as Record<string, string | number | null>)[id];
}

function writeAnswer(id: string, value: string | number | null): void {
  const store = answers as unknown as Record<string, string | number | null>;
  store[id] = value;
  // `driving` is only ever asked once hiring === 'yes'. Hiding it is not
  // enough: an answer left behind from an earlier 'yes' would silently
  // re-apply — and re-add the chauffeur's-insurance step — the moment the
  // reader switched back, without them ever seeing the question again.
  if (id === 'hiring' && value !== 'yes') store.driving = null;
  render();
}

for (const block of questionsEl.querySelectorAll<HTMLElement>('[data-question]')) {
  const id = block.dataset.question!;

  for (const btn of block.querySelectorAll<HTMLButtonElement>('[data-option]')) {
    btn.addEventListener('click', () => {
      const value = btn.dataset.option!;
      writeAnswer(id, readAnswer(id) === value ? null : value);
    });
  }

  const select = block.querySelector<HTMLSelectElement>('select');
  select?.addEventListener('change', () => writeAnswer(id, select.value || null));

  const number = block.querySelector<HTMLInputElement>('input[type="number"]');
  number?.addEventListener('input', () => {
    if (number.value === '') {
      writeAnswer(id, null);
      return;
    }
    const n = Number(number.value);
    writeAnswer(id, Number.isNaN(n) ? null : n);
  });
}

startOverBtn?.addEventListener('click', () => {
  answers = emptyAnswers();
  stage = 1;
  for (const btn of questionsEl.querySelectorAll('[data-option]')) btn.classList.remove('is-selected');
  for (const select of questionsEl.querySelectorAll('select')) select.value = '';
  for (const input of questionsEl.querySelectorAll<HTMLInputElement>('input[type="number"]'))
    input.value = '';
  render();
});

function goToStage(next: number): void {
  const stages = stageBreakdown(content.questions, answers);
  const first = stages[0]?.stage ?? 1;
  const last = stages[stages.length - 1]?.stage ?? 1;
  stage = Math.min(Math.max(next, first), last);
  render();
  // Bring the panel back into view: on a phone the question column sits
  // above a results panel that is often taller than the screen, so
  // advancing a stage without this can leave the reader looking at
  // unchanged results with the new questions somewhere off-screen.
  questionsEl!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

prevBtn?.addEventListener('click', () => goToStage(stage - 1));
nextBtn?.addEventListener('click', () => goToStage(stage + 1));

railEl?.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-stage-go]');
  if (target) goToStage(Number(target.dataset.stageGo));
});

// Draws the progress rail and the back/next controls for the current
// stage. Every stage stays reachable at any time — the rail's buttons are
// never disabled — because this is an exploratory tool, not a linear
// form: a reader who wants to skip ahead to the patente estimate and
// leave the rest blank is doing something reasonable.
function renderStages(): void {
  const stages = stageBreakdown(content.questions, answers);
  const visibleIds = new Set(
    stages.find((s) => s.stage === stage)?.questions.map((q) => q.id) ?? [],
  );

  for (const block of questionsEl!.querySelectorAll<HTMLElement>('[data-question]')) {
    block.hidden = !visibleIds.has(block.dataset.question!);
  }

  if (railEl) {
    railEl.innerHTML = stages
      .map((s) => {
        const name = STAGE_NAMES[s.stage]?.[lang] ?? String(s.stage);
        const state = s.stage === stage ? 'is-current' : s.complete ? 'is-done' : '';
        return `
          <button type="button" class="stage-step ${state}" data-stage-go="${s.stage}"
                  aria-current="${s.stage === stage ? 'step' : 'false'}">
            <span class="stage-num">${s.complete && s.stage !== stage ? '✓' : s.stage}</span>
            <span class="stage-name">${escapeHtml(name)}</span>
            <span class="stage-count">${s.answered}/${s.total}</span>
          </button>`;
      })
      .join('');
  }

  const first = stages[0]?.stage ?? 1;
  const last = stages[stages.length - 1]?.stage ?? 1;
  if (prevBtn) {
    prevBtn.hidden = stage <= first;
    prevBtn.textContent = UI_TEXT.stagePrev![lang];
  }
  if (nextBtn) {
    nextBtn.hidden = stage >= last;
    nextBtn.textContent = UI_TEXT.stageNext![lang];
  }
}

// G-19: re-labels the question panel's static text from `content` (already
// bilingual) plus UI_TEXT's `data-i18n` strings. Kept separate from
// render(), which only ever touches the results panel — this runs once on
// every langchange, render() runs on every answer change too.
function applyStaticText(): void {
  for (const block of questionsEl!.querySelectorAll<HTMLElement>('[data-question]')) {
    const q = content.questions.find((question) => question.id === block.dataset.question);
    if (!q) continue;

    const labelEl = block.querySelector<HTMLElement>('.question-label');
    if (labelEl) labelEl.textContent = q.label[lang];
    const hintEl = block.querySelector<HTMLElement>('.question-hint');
    if (hintEl && q.hint) hintEl.textContent = q.hint[lang];

    const group = block.querySelector<HTMLElement>('[role="group"]');
    if (group) group.setAttribute('aria-label', q.label[lang]);
    const select = block.querySelector<HTMLSelectElement>('select');
    if (select) select.setAttribute('aria-label', q.label[lang]);
    const number = block.querySelector<HTMLInputElement>('input[type="number"]');
    if (number) number.setAttribute('aria-label', q.label[lang]);

    for (const optionEl of block.querySelectorAll<HTMLButtonElement>('[data-option]')) {
      const o = q.options?.find((opt) => opt.value === optionEl.dataset.option);
      if (!o) continue;
      // Writes into the label/detail spans rather than the button's own
      // textContent (G-27): assigning to the button would flatten both
      // spans away and the option would lose its detail line on the first
      // language switch.
      const labelSpan = optionEl.querySelector<HTMLElement>('.option-label');
      if (labelSpan) labelSpan.textContent = o.label[lang];
      const detailSpan = optionEl.querySelector<HTMLElement>('.option-detail');
      if (detailSpan && o.detail) detailSpan.innerHTML = o.detail[lang];
    }
    for (const optionEl of block.querySelectorAll<HTMLOptionElement>('select option[value]')) {
      if (optionEl.value === '') continue;
      const o = q.options?.find((opt) => opt.value === optionEl.value);
      if (o) optionEl.textContent = o.label[lang];
    }

    if (q.help) {
      const summaryEl = block.querySelector<HTMLElement>('[data-help-summary]');
      if (summaryEl) summaryEl.textContent = q.help.summary[lang];
      const bodyEl = block.querySelector<HTMLElement>('[data-help-body]');
      if (bodyEl) bodyEl.innerHTML = q.help.body[lang];
    }
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = el.dataset.i18n!;
    const copy = UI_TEXT[key];
    if (copy) el.textContent = copy[lang];
  }
}

// A claim's sourcing mark (G-15/G-09): `primary` is the confirmed default
// and gets no mark at all. Shared by step cards, incentive cards, and
// src/pages/index.astro's entity table, via sourcing-label.ts.
function sourcingMark(sourcing: 'primary' | 'secondary' | 'unverified'): string {
  return sourcing === 'primary'
    ? ''
    : `<span class="mark mark-${sourcing}">${sourcingLabel(sourcing, lang)}</span>`;
}

// `practice.contradicted` is the loudest state on the page (G-15) — a
// filled banner, not the bordered `mark` tag `sourcingMark` produces above,
// so it reads as more urgent than a plain unverified figure.
// `practice.unknown` has nothing worth saying and renders nothing.
function practiceBanner(practice: StepResult['practice']): string {
  if (!practice) return '';
  const headline = practiceHeadline(practice.status, lang);
  if (!headline) return '';
  return `
    <p class="practice-banner practice-${practice.status}">
      <b>${escapeHtml(headline)}</b>
      <span class="practice-attribution">${escapeHtml(practiceAttribution(practice))}</span>
    </p>`;
}

// G-18: this decision needs a CPA or attorney, not just this guide.
function professionalNote(professional: StepResult['professional']): string {
  if (!professional) return '';
  return `<p class="step-professional">→ ${UI_TEXT.consult![lang]} ${escapeHtml(professionalLabel(professional, lang))}</p>`;
}

// Shared by the one-time sequence and the recurring-obligations list
// (G-13): same card shape either way, differing only in what marks a step's
// position — a sequence number for the one-time list, the recurring badge
// (↻) for the other, since recurring duties have no "step N" to be.
function stepCard(s: StepResult, mark: string): string {
  return `
    <li class="step" data-severity="${s.severity ?? ''}">
      <span class="step-num">${mark}</span>
      <div class="step-body">
        <h4 class="step-title">${escapeHtml(s.title[lang])} ${sourcingMark(s.sourcing)}</h4>
        <p class="step-meta">${escapeHtml(s.agency[lang])} · ${escapeHtml(s.timing[lang])} · ${escapeHtml(s.cost[lang])}</p>
        ${s.blocks ? `<p class="step-blocks">→ ${UI_TEXT.blocks![lang]}: <b>${escapeHtml(s.blocks[lang])}</b></p>` : ''}
        ${professionalNote(s.professional)}
        <p class="step-note">${s.note[lang]}</p>
        ${practiceBanner(s.practice)}
      </div>
    </li>`;
}

function render(): void {
  // renderStages() owns which question blocks are shown (G-28) — it hides
  // everything outside the current stage, which subsumes the per-question
  // `driving` filter this loop used to apply, since stageBreakdown() is
  // itself built on visibleQuestions().
  renderStages();
  for (const block of questionsEl!.querySelectorAll<HTMLElement>('[data-question]')) {
    for (const btn of block.querySelectorAll<HTMLButtonElement>('[data-option]')) {
      btn.classList.toggle('is-selected', readAnswer(block.dataset.question!) === btn.dataset.option);
    }
  }

  if (!hasEnoughAnswers(content.questions, answers)) {
    emptyStateEl!.hidden = false;
    resultsEl!.hidden = true;
    return;
  }
  emptyStateEl!.hidden = true;
  resultsEl!.hidden = false;

  const result = buildSequence(answers, content);
  const { patente, municipio } = result;

  // Recurring obligations are ongoing duties, not steps in a one-time
  // sequence (G-13's split — see partitionRecurring in decision-tree.ts for
  // why). `oneTime.length`, not `result.steps.length`, is what "steps in
  // your sequence" now means, since the recurring ones moved to their own
  // section below.
  const { oneTime, recurring } = partitionRecurring(result.steps);

  // G-09: a rate that could not be confirmed "must surface as uncertain
  // rather than being rendered as plain numbers" — so the mark sits on the
  // figure itself, which is what a reader takes at face value, not only in
  // the prose underneath it.
  const patenteValue = patente ? (patente.amount === 0 ? '$0' : formatMoney(patente.amount)) : '—';
  const patenteMark = patente ? sourcingMark(patente.sourcing) : '';

  glanceEl!.innerHTML = `
    <div class="glance-cell">
      <span class="glance-label">${UI_TEXT.glanceSteps![lang]}</span>
      <span class="glance-value">${oneTime.length}</span>
    </div>
    <div class="glance-cell">
      <span class="glance-label">${UI_TEXT.glanceIncentives![lang]}</span>
      <span class="glance-value">${result.incentives.length}</span>
    </div>
    <div class="glance-cell">
      <span class="glance-label">${UI_TEXT.glancePatente![lang]}</span>
      <span class="glance-value">${patenteValue} ${patenteMark}</span>
      ${patente ? `<span class="glance-sub">${escapeHtml(patente.why[lang])}</span>` : ''}
      ${
        municipio?.note
          ? `<span class="glance-sub glance-muni-note">${municipio.note[lang]}</span>`
          : ''
      }
    </div>
  `;

  sequenceEl!.innerHTML = oneTime.map((s, i) => stepCard(s, String(i + 1))).join('');
  recurringEl!.innerHTML = recurring.map((s) => stepCard(s, '↻')).join('');

  incentivesEl!.innerHTML = result.incentives
    .map(
      (inc) => `
    <div class="incentive-card">
      <h4>${escapeHtml(inc.title[lang])} ${sourcingMark(inc.sourcing)}</h4>
      ${professionalNote(inc.professional)}
      <p>${inc.note[lang]}</p>
      ${practiceBanner(inc.practice)}
    </div>`,
    )
    .join('');
}

document.addEventListener('langchange', (event) => {
  lang = (event as CustomEvent<Lang>).detail;
  applyStaticText();
  render();
});

applyStaticText();
render();
