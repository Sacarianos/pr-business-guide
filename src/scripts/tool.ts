// Client-side glue for the ten-question flow (G-08). Deliberately vanilla —
// no framework, per the "zero JavaScript by default" principle (0001): the
// question panel is the one part of the page that has to be interactive,
// so it is a small hand-written island rather than pulling in Preact for a
// form. All the actual logic (branching, patente arithmetic) comes from
// decision-tree.ts (G-06) unchanged — this file only wires DOM events to
// it and renders the result.
import {
  buildSequence,
  emptyAnswers,
  formatMoney,
  hasEnoughAnswers,
  visibleQuestions,
  type Answers,
  type Content,
} from '../lib/decision-tree.ts';

const dataEl = document.getElementById('tool-content');
if (!dataEl?.textContent) throw new Error('tool.ts: #tool-content is missing');
const content: Content = JSON.parse(dataEl.textContent);

const questionsEl = document.querySelector<HTMLElement>('[data-questions]');
const emptyStateEl = document.querySelector<HTMLElement>('[data-empty-state]');
const resultsEl = document.querySelector<HTMLElement>('[data-results]');
const glanceEl = document.querySelector<HTMLElement>('[data-glance]');
const sequenceEl = document.querySelector<HTMLElement>('[data-sequence]');
const incentivesEl = document.querySelector<HTMLElement>('[data-incentives]');
const startOverBtn = document.querySelector<HTMLButtonElement>('[data-start-over]');

if (!questionsEl || !emptyStateEl || !resultsEl || !glanceEl || !sequenceEl || !incentivesEl) {
  throw new Error('tool.ts: expected page markup is missing');
}

let answers: Answers = emptyAnswers();

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

  // G-09: a rate that could not be confirmed "must surface as uncertain
  // rather than being rendered as plain numbers" — so the mark sits on the
  // figure itself, which is what a reader takes at face value, not only in
  // the prose underneath it.
  const patenteValue = patente ? (patente.amount === 0 ? '$0' : formatMoney(patente.amount)) : '—';
  const patenteMark =
    patente && patente.sourcing !== 'primary'
      ? `<span class="mark mark-${patente.sourcing}">${
          patente.sourcing === 'secondary' ? 'sin confirmar' : 'sin verificar'
        }</span>`
      : '';

  glanceEl!.innerHTML = `
    <div class="glance-cell">
      <span class="glance-label">Pasos en tu secuencia</span>
      <span class="glance-value">${result.steps.length}</span>
    </div>
    <div class="glance-cell">
      <span class="glance-label">Incentivos aplicables</span>
      <span class="glance-value">${result.incentives.length}</span>
    </div>
    <div class="glance-cell">
      <span class="glance-label">Patente estimada</span>
      <span class="glance-value">${patenteValue} ${patenteMark}</span>
      ${patente ? `<span class="glance-sub">${escapeHtml(patente.why.es)}</span>` : ''}
      ${
        municipio?.note
          ? `<span class="glance-sub glance-muni-note">${municipio.note.es}</span>`
          : ''
      }
    </div>
  `;

  sequenceEl!.innerHTML = result.steps
    .map(
      (s, i) => `
    <li class="step" data-severity="${s.severity ?? ''}">
      <span class="step-num">${i + 1}</span>
      <div class="step-body">
        <h4 class="step-title">${escapeHtml(s.title.es)}</h4>
        <p class="step-meta">${escapeHtml(s.agency.es)} · ${escapeHtml(s.timing.es)} · ${escapeHtml(s.cost.es)}</p>
        ${s.blocks ? `<p class="step-blocks">→ Bloquea: <b>${escapeHtml(s.blocks.es)}</b></p>` : ''}
        <p class="step-note">${s.note.es}</p>
      </div>
    </li>`,
    )
    .join('');

  incentivesEl!.innerHTML = result.incentives
    .map(
      (inc) => `
    <div class="incentive-card">
      <h4>${escapeHtml(inc.title.es)}</h4>
      <p>${inc.note.es}</p>
    </div>`,
    )
    .join('');
}

render();
