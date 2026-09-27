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
