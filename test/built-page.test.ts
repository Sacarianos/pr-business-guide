// Checks on the built page itself, the second seam in
// issues/0002-route-redesign.md. `pretest` builds first, and this suite
// reads the output the same way decision-tree.test.ts reads
// dist/content.json: whatever ships is what gets checked. Anything static
// belongs here (tokens, contrast, section order, print rules); anything a
// reader has to click belongs to the browser protocol in 0002.
import { strict as assert } from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const dist = join(import.meta.dirname, '..', 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');

// Astro may emit a stylesheet under _astro/ or inline small ones into the
// page, so both places count as "the built CSS".
const css = [
  ...readdirSync(join(dist, '_astro'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(dist, '_astro', f), 'utf8')),
  ...[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!),
].join('\n');

// Every custom property declared in a `:root` rule, last declaration wins.
function rootTokens(): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const block of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const decl of block[1]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      tokens.set(decl[1]!, decl[2]!.trim().toLowerCase());
    }
  }
  return tokens;
}

// G-29
const PALETTE: Record<string, string> = {
  '--paper': '#f5f3ee',
  '--surface': '#fff',
  '--sunk': '#efece5',
  '--ink': '#15181b',
  '--ink-2': '#474d54',
  '--ink-3': '#62686f',
  '--rule': '#e2ded4',
  '--rule-strong': '#cfcabd',
  '--brand': '#0b5a48',
  '--brand-hover': '#084636',
  '--brand-tint': '#e3eee9',
  '--on-brand': '#fff',
  '--mark': '#f2b233',
  '--warn-ink': '#8a5a00',
  '--warn-bg': '#fdf3dc',
  '--stop-ink': '#a4251c',
  '--stop-bg': '#fbe9e6',
  '--ok': '#1f6b45',
  '--ok-bg': '#e5f1ea',
};

// The minifier may shorten #ffffff to #fff; compare the expanded forms.
function expandHex(value: string): string {
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value);
  return m ? `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}` : value;
}

test('G-29: the built CSS never follows the operating system into a dark palette', () => {
  assert.doesNotMatch(css, /prefers-color-scheme/);
});

test('G-29: none of the retired palette tokens survive in the built CSS', () => {
  for (const old of ['--sello', '--ambar', '--derogado', '--verificado']) {
    assert.ok(!css.includes(old), `${old} is still in the built CSS`);
  }
});

test('G-29: :root defines every Verde ruta token with its specified value', () => {
  const tokens = rootTokens();
  for (const [name, value] of Object.entries(PALETTE)) {
    assert.ok(tokens.has(name), `${name} is missing from :root`);
    assert.equal(expandHex(tokens.get(name)!), expandHex(value), `${name} has the wrong value`);
  }
});

// G-32. The built HTML is this test's contract: the hero is static output,
// so what it says is exactly what a first-time visitor reads.
const contentJson = JSON.parse(readFileSync(join(dist, 'content.json'), 'utf8')) as {
  steps: Record<string, unknown>;
  municipios: Record<string, unknown>;
};

function between(source: string, start: string, end: string): string {
  const from = source.indexOf(start);
  assert.ok(from >= 0, `${start} is missing from the built page`);
  const to = source.indexOf(end, from);
  assert.ok(to > from, `${end} does not close ${start}`);
  return source.slice(from, to);
}

test('G-32: the page has exactly one hero', () => {
  assert.equal(html.match(/data-hero/g)?.length, 1);
});

test('G-32: the sample route shows the first four procedures of the example, in order', () => {
  const sample = between(html, 'data-sample-route', '</aside>');
  const titles = [...sample.matchAll(/class="sample-stop-title"[^>]*>\s*<span lang="es"[^>]*>([^<]+)</g)].map(
    (m) => m[1]!.trim(),
  );
  assert.deepEqual(titles, [
    'Organizar la LLC',
    'Decidir la clasificación contributiva de la LLC',
    'Obtener el EIN federal',
    'Registro de Comerciantes',
  ]);
  assert.match(sample, /data-sample-more="8"/);
});

test('G-32: the proof numbers come from the content and the research date', () => {
  const proof = (key: string) => new RegExp(`data-proof="${key}"[^>]*>([^<]+)<`).exec(html)?.[1]?.trim();
  assert.equal(proof('steps'), String(Object.keys(contentJson.steps).length));
  assert.equal(proof('municipios'), String(Object.keys(contentJson.municipios).filter((id) => id !== 'other').length));
  assert.equal(proof('date'), '6 ago 2026');
});

// G-35. The print stylesheet is generated output the browser reads when a
// reader prints; its @media print rules are the contract that the route
// prints alone and fully expanded.
test('G-35: printing hides everything but the route and incentives, and expands every stop', () => {
  const blocks = [...css.matchAll(/@media print\s*\{([\s\S]*?\})\s*\}/g)].map((m) => m[1]!).join('\n');
  assert.ok(blocks.length > 0, 'no @media print block in the built CSS');
  const hiding = /([^{}]+)\{[^}]*display:\s*none/.exec(blocks)?.[1] ?? '';
  for (const selector of ['.top', '[data-hero]', '[data-questions]', '#proceso', '#entidades', '#limites']) {
    assert.ok(hiding.includes(selector), `print does not hide ${selector}`);
  }
  assert.match(blocks, /\[data-stop-detail\]\s*\{[^}]*display:\s*block/);
});

// G-37. WCAG 2.x relative luminance and contrast ratio, computed from the
// token values the built CSS actually ships.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(expandHex(hex).slice(i, i + 2), 16) / 255).map(
    (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4),
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

test('G-37: every text pair on the page meets WCAG AA, 4.5:1', () => {
  const t = rootTokens();
  const pairs: [string, string][] = [
    ...['--ink', '--ink-2', '--ink-3'].flatMap((fg) =>
      ['--paper', '--surface', '--sunk'].map((bg) => [fg, bg] as [string, string]),
    ),
    ['--on-brand', '--brand'],
    ['--brand', '--surface'],
    ['--brand', '--paper'],
    ['--brand', '--brand-tint'],
    ['--warn-ink', '--warn-bg'],
    ['--stop-ink', '--stop-bg'],
    ['--ok', '--ok-bg'],
    ['--ink', '--mark'],
  ];
  for (const [fg, bg] of pairs) {
    const ratio = contrast(t.get(fg)!, t.get(bg)!);
    assert.ok(ratio >= 4.5, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`);
  }
});

test('G-37: the contrast check itself matches known WCAG values', () => {
  assert.equal(contrast('#000000', '#ffffff').toFixed(2), '21.00');
  assert.equal(contrast('#767676', '#ffffff').toFixed(2), '4.54');
});
