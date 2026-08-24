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
  visibleQuestions,
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
  for (const btn of questionsEl.querySelectorAll('[data-option]')) btn.classList.remove('is-selected');
  for (const select of questionsEl.querySelectorAll('select')) select.value = '';
  for (const input of questionsEl.querySelectorAll<HTMLInputElement>('input[type="number"]'))
    input.value = '';
  render();
});

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
      if (o) optionEl.textContent = o.label[lang];
    }
    for (const optionEl of block.querySelectorAll<HTMLOptionElement>('select option[value]')) {
      if (optionEl.value === '') continue;
      const o = q.options?.find((opt) => opt.value === optionEl.value);
      if (o) optionEl.textContent = o.label[lang];
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
  const visible = new Set(visibleQuestions(content.questions, answers).map((q) => q.id));
  for (const block of questionsEl!.querySelectorAll<HTMLElement>('[data-question]')) {
    block.hidden = !visible.has(block.dataset.question!);
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
