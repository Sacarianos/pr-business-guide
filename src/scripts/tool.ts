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
  answersFromQuery,
  answersToQuery,
  buildSequence,
  emptyAnswers,
  formatMoney,
  groupByPhase,
  hasEnoughAnswers,
  routeHeading,
  routeSummary,
  stageBreakdown,
  type Answers,
  type Content,
  type PhaseGroup,
  type RouteStop,
  type StepResult,
} from '../lib/decision-tree.ts';
import { researchDateShort } from '../lib/freshness.ts';
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
const emptyStateEl = document.querySelector<HTMLElement>('[data-route-empty]');
const resultsEl = document.querySelector<HTMLElement>('[data-results]');
const headingEl = document.querySelector<HTMLElement>('[data-route-heading]');
const sublineEl = document.querySelector<HTMLElement>('[data-route-subline]');
const summaryEl = document.querySelector<HTMLElement>('[data-summary-strip]');
const patenteNoteEl = document.querySelector<HTMLElement>('[data-patente-note]');
const zonesEl = document.querySelector<HTMLElement>('[data-zones]');
const incentivesEl = document.querySelector<HTMLElement>('[data-incentives]');
const incentivesBandEl = document.querySelector<HTMLElement>('[data-incentives-band]');
const actionsEl = document.querySelector<HTMLElement>('[data-route-actions]');
const copyBtn = document.querySelector<HTMLButtonElement>('[data-copy-link]');
const printBtn = document.querySelector<HTMLButtonElement>('[data-print]');
const copyStatusEl = document.querySelector<HTMLElement>('[data-copy-status]');
const copyFallbackEl = document.querySelector<HTMLInputElement>('[data-copy-fallback]');
const startOverBtn = document.querySelector<HTMLButtonElement>('[data-start-over]');
const railEl = document.querySelector<HTMLElement>('[data-stage-rail]');
const prevBtn = document.querySelector<HTMLButtonElement>('[data-stage-prev]');
const nextBtn = document.querySelector<HTMLButtonElement>('[data-stage-next]');
const stageHintEl = document.querySelector<HTMLElement>('[data-stage-hint]');
const routeEl = document.querySelector<HTMLElement>('[data-route]');

if (
  !questionsEl ||
  !emptyStateEl ||
  !resultsEl ||
  !headingEl ||
  !sublineEl ||
  !summaryEl ||
  !patenteNoteEl ||
  !zonesEl ||
  !incentivesEl
) {
  throw new Error('tool.ts: expected page markup is missing');
}

// G-31: the URL is the state. Seeded from the query before the first
// render, and written back on every render.
let answers: Answers = answersFromQuery(location.search, content.questions);
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
    es: 'Contesta 3 preguntas y tu ruta aparece aquí.',
    en: 'Answer 3 questions and your route appears here.',
  },
  routeEyebrow: { es: 'Tu ruta', en: 'Your route' },
  incentivesTitle: { es: 'Incentivos aplicables', en: 'Applicable incentives' },
  summarySteps: { es: 'Trámites', en: 'Procedures' },
  summaryRecurring: { es: 'Recurrentes', en: 'Recurring' },
  summaryPatente: { es: 'Patente est.', en: 'Est. patente' },
  summaryVerified: { es: 'Verificado', en: 'Verified' },
  patenteNone: { es: 'Sin estimar', en: 'Not estimated' },
  perYear: { es: '/año', en: '/yr' },
  costUnknown: { es: 'n/d', en: 'n/a' },
  showDetail: { es: 'Ver detalles', en: 'Show details' },
  hideDetail: { es: 'Ocultar detalles', en: 'Hide details' },
  finishTitle: { es: 'Listo para abrir', en: 'Ready to open' },
  copyLink: { es: 'Copiar enlace', en: 'Copy link' },
  print: { es: 'Imprimir', en: 'Print' },
  copied: { es: 'Enlace copiado', en: 'Link copied' },
  copyByHand: { es: 'Copia el enlace', en: 'Copy the link' },
  finishText: {
    es: 'Revisa los incentivos antes de radicar.',
    en: 'Check the incentives before you file.',
  },
  blocks: { es: 'Bloquea', en: 'Blocks' },
  consult: { es: 'Consulta con', en: 'Talk to' },
  stagePrev: { es: 'Atrás', en: 'Back' },
  stageNext: { es: 'Continuar', en: 'Continue' },
  stageLast: { es: 'Ver mi ruta', en: 'See my route' },
  stageHint: { es: 'Siguiente:', en: 'Next:' },
  stageOf: { es: 'de', en: 'of' },
  selectPlaceholder: { es: 'Escoge un municipio', en: 'Choose a municipality' },
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

// Fills the select and number inputs from `answers` after a page opened
// from a link. Option buttons need nothing here: render() already sets
// aria-pressed from `answers` on every pass.
function syncInputs(): void {
  for (const block of questionsEl!.querySelectorAll<HTMLElement>('[data-question]')) {
    const value = readAnswer(block.dataset.question!);
    const select = block.querySelector<HTMLSelectElement>('select');
    if (select) select.value = value === null ? '' : String(value);
    const number = block.querySelector<HTMLInputElement>('input[type="number"]');
    if (number) number.value = value === null ? '' : String(value);
  }
}

// replaceState, not pushState: one history entry per click would turn the
// back button into an undo stack for answers, which nobody asked for.
function syncUrl(): void {
  const query = answersToQuery(answers, content.questions);
  const url = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
  if (url !== `${location.pathname}${location.search}${location.hash}`) {
    history.replaceState(history.state, '', url);
  }
}

startOverBtn?.addEventListener('click', () => {
  answers = emptyAnswers();
  stage = 1;
  for (const select of questionsEl.querySelectorAll('select')) select.value = '';
  for (const input of questionsEl.querySelectorAll<HTMLInputElement>('input[type="number"]'))
    input.value = '';
  render();
});

// Smooth scrolling unless the reader asked the OS for less motion.
function scrollBehavior(): ScrollBehavior {
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

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
  questionsEl!.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
}

prevBtn?.addEventListener('click', () => goToStage(stage - 1));
nextBtn?.addEventListener('click', () => {
  const stages = stageBreakdown(content.questions, answers);
  const last = stages[stages.length - 1]?.stage ?? 1;
  if (stage < last) {
    goToStage(stage + 1);
    return;
  }
  // The last stage's button reads "Ver mi ruta": the questions are done, so
  // take the reader to the route. It matters most on a phone, where the
  // route sits below the whole question column.
  routeEl?.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
});

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
        const state = s.stage === stage ? 'current' : s.complete ? 'done' : 'todo';
        return `
          <button type="button" class="stage-step" data-stage-go="${s.stage}" data-state="${state}"
                  aria-current="${s.stage === stage ? 'step' : 'false'}">
            <span class="stage-count">${s.stage} · ${s.answered} ${UI_TEXT.stageOf![lang]} ${s.total}</span>
            <span class="stage-name">${escapeHtml(name)}</span>
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
    nextBtn.textContent = (stage >= last ? UI_TEXT.stageLast! : UI_TEXT.stageNext!)[lang];
  }
  if (stageHintEl) {
    const upcoming = STAGE_NAMES[stage + 1]?.[lang];
    stageHintEl.textContent = stage < last && upcoming ? `${UI_TEXT.stageHint![lang]} ${upcoming}` : '';
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
  return `<p class="stop-professional">→ ${UI_TEXT.consult![lang]} ${escapeHtml(professionalLabel(professional, lang))}</p>`;
}

// Which stops the reader has opened, by step id, so a re-render on an
// answer change or a language switch doesn't slam them shut again.
const openStops = new Set<string>();

// The toggle and its detail share an id so aria-controls points at the
// region it opens (0002, G-34: the route reads as a list per phase, and
// each detail announces whether it's expanded).
function detailToggle(s: StepResult): string {
  const open = openStops.has(s.id);
  return `
    <button type="button" class="stop-toggle" data-stop-toggle="${s.id}"
            aria-expanded="${open}" aria-controls="detail-${s.id}">${(open ? UI_TEXT.hideDetail! : UI_TEXT.showDetail!)[lang]}</button>
    <div class="stop-detail" id="detail-${s.id}" data-stop-detail ${open ? '' : 'hidden'}>${s.note[lang]}</div>`;
}

// What stays visible on a collapsed stop (0002): what it blocks, whether it
// needs a professional, and above all a practice banner, which G-15 makes
// the loudest state on the page and so never hides behind a toggle.
function alwaysVisible(s: StepResult): string {
  return `
    ${s.blocks ? `<p class="stop-blocks">${UI_TEXT.blocks![lang]}: ${escapeHtml(s.blocks[lang])}</p>` : ''}
    ${professionalNote(s.professional)}
    ${practiceBanner(s.practice)}`;
}

function stopItem(s: RouteStop): string {
  const marker = s.recurring ? '↻' : String(s.number);
  const hasAgency = s.agency[lang] !== '—';
  const hasTiming = s.timing[lang] !== '—';
  const meta = [hasAgency ? `<b>${escapeHtml(s.agency[lang])}</b>` : '', hasTiming ? escapeHtml(s.timing[lang]) : '']
    .filter(Boolean)
    .join(' · ');
  const cost = s.cost[lang] === '—' ? UI_TEXT.costUnknown![lang] : s.cost[lang];
  return `
    <li class="stop" data-stop="${s.id}" data-kind="action" data-severity="${s.severity ?? ''}" data-sourcing="${s.sourcing}">
      <span class="pin${s.recurring ? ' pin-recurring' : ''}" data-stop-num>${marker}</span>
      <div class="stop-head">
        <h5 class="stop-title">${escapeHtml(s.title[lang])} ${sourcingMark(s.sourcing)}</h5>
        ${meta ? `<p class="stop-meta">${meta}</p>` : ''}
      </div>
      <div class="stop-cost">${escapeHtml(cost)}</div>
      <div class="stop-body">
        ${alwaysVisible(s)}
        ${detailToggle(s)}
      </div>
    </li>`;
}

const CALLOUT_ICON = `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5l8 14H2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 8v4M10 14.5v.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

function calloutItem(s: RouteStop): string {
  return `
    <div class="callout" data-stop="${s.id}" data-kind="advisory" data-severity="${s.severity ?? ''}" data-sourcing="${s.sourcing}">
      ${CALLOUT_ICON}
      <div>
        <p class="callout-title">${escapeHtml(s.title[lang])} ${sourcingMark(s.sourcing)}</p>
        ${alwaysVisible(s)}
        ${detailToggle(s)}
      </div>
    </div>`;
}

function zone(g: PhaseGroup): string {
  const actions = g.stops.filter((s) => s.kind === 'action');
  const advisories = g.stops.filter((s) => s.kind === 'advisory');
  return `
    <section class="zone" data-phase="${g.phase}">
      <div class="zone-head">
        <h4 class="zone-title">${escapeHtml(g.title[lang])}</h4>
        <span class="zone-count">${actions.length}</span>
      </div>
      <ol class="route-list">${actions.map(stopItem).join('')}</ol>
      ${advisories.map(calloutItem).join('')}
    </section>`;
}

zonesEl.addEventListener('click', (event) => {
  const toggle = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-stop-toggle]');
  if (!toggle) return;
  const id = toggle.dataset.stopToggle!;
  if (openStops.has(id)) openStops.delete(id);
  else openStops.add(id);
  const open = openStops.has(id);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = (open ? UI_TEXT.hideDetail! : UI_TEXT.showDetail!)[lang];
  const detail = document.getElementById(`detail-${id}`);
  if (detail) detail.hidden = !open;
});

function render(): void {
  // renderStages() owns which question blocks are shown (G-28) — it hides
  // everything outside the current stage, which subsumes the per-question
  // `driving` filter this loop used to apply, since stageBreakdown() is
  // itself built on visibleQuestions().
  renderStages();
  syncUrl();
  for (const block of questionsEl!.querySelectorAll<HTMLElement>('[data-question]')) {
    for (const btn of block.querySelectorAll<HTMLButtonElement>('[data-option]')) {
      btn.setAttribute('aria-pressed', String(readAnswer(block.dataset.question!) === btn.dataset.option));
    }
  }

  const heading = routeHeading(answers, content);
  headingEl!.textContent = heading.title[lang];
  sublineEl!.textContent = heading.subline[lang];

  if (!hasEnoughAnswers(content.questions, answers)) {
    emptyStateEl!.hidden = false;
    resultsEl!.hidden = true;
    if (incentivesBandEl) incentivesBandEl.hidden = true;
    if (actionsEl) actionsEl.hidden = true;
    return;
  }
  emptyStateEl!.hidden = true;
  resultsEl!.hidden = false;
  if (incentivesBandEl) incentivesBandEl.hidden = false;
  if (actionsEl) actionsEl.hidden = false;

  const result = buildSequence(answers, content);
  const summary = routeSummary(result);
  const { patente, municipio } = result;

  // G-09: a rate that could not be confirmed "must surface as uncertain
  // rather than being rendered as plain numbers", so the mark sits on the
  // figure itself, which is what a reader takes at face value.
  const patenteValue = !patente
    ? UI_TEXT.patenteNone![lang]
    : patente.amount === 0
      ? '$0'
      : `${formatMoney(patente.amount)}${UI_TEXT.perYear![lang]}`;

  // The mark goes beside the value rather than inside [data-summary], so
  // the value reads cleanly and the mark still sits on the figure itself.
  const cell = (key: string, label: string, value: string, mark = '') =>
    `<div class="summary-cell"><dt>${label}</dt><dd><span data-summary="${key}">${value}</span>${mark}</dd></div>`;
  summaryEl!.innerHTML = [
    cell('steps', UI_TEXT.summarySteps![lang], String(summary.steps)),
    cell('recurring', UI_TEXT.summaryRecurring![lang], String(summary.recurring)),
    cell('patente', UI_TEXT.summaryPatente![lang], escapeHtml(patenteValue), patente ? sourcingMark(patente.sourcing) : ''),
    cell('verified', UI_TEXT.summaryVerified![lang], researchDateShort(lang)),
  ].join('');
  patenteNoteEl!.innerHTML = [
    patente ? `<p>${escapeHtml(patente.why[lang])}</p>` : '',
    municipio?.note ? `<p>${municipio.note[lang]}</p>` : '',
  ].join('');

  zonesEl!.innerHTML = groupByPhase(result, content).map(zone).join('');

  incentivesEl!.innerHTML = result.incentives
    .map(
      (inc) => `
    <article class="card" data-incentive="${inc.id}">
      ${inc.law ? `<span class="card-law" data-law>${escapeHtml(inc.law)}</span>` : ''}
      <h3>${escapeHtml(inc.title[lang])} ${sourcingMark(inc.sourcing)}</h3>
      ${professionalNote(inc.professional)}
      <p>${inc.note[lang]}</p>
      ${practiceBanner(inc.practice)}
    </article>`,
    )
    .join('');
}

// G-35: the URL already holds the route (G-31), so sharing it is copying
// the address. When the clipboard refuses, which happens in some embedded
// and older browsers, the link shows up selected for copying by hand.
copyBtn?.addEventListener('click', async () => {
  if (copyFallbackEl) copyFallbackEl.hidden = true;
  try {
    await navigator.clipboard.writeText(location.href);
    if (copyStatusEl) copyStatusEl.textContent = UI_TEXT.copied![lang];
  } catch {
    if (copyStatusEl) copyStatusEl.textContent = UI_TEXT.copyByHand![lang];
    if (copyFallbackEl) {
      copyFallbackEl.value = location.href;
      copyFallbackEl.hidden = false;
      copyFallbackEl.select();
    }
  }
});

printBtn?.addEventListener('click', () => window.print());

document.addEventListener('langchange', (event) => {
  lang = (event as CustomEvent<Lang>).detail;
  applyStaticText();
  render();
});

applyStaticText();
syncInputs();
render();
