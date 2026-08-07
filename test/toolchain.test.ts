// Preconditions for the way this repository runs its tests.
//
// 0001 settles Seam A as the `decision-tree` module and expects the existing
// 44-assertion Node suite to survive the migration into Astro unchanged, which
// it can only do if the runner stays plain `node:test` with no build step. That
// rests on Node erasing type annotations natively, so the two assertions below
// guard it from both directions: the Node actually running, and the Node the
// manifest promises.
//
// The type annotations in this file are themselves the first line of defence —
// without stripping, it does not parse, and the suite goes red rather than
// quietly skipping.
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

type Version = readonly [major: number, minor: number, patch: number];

// Type-stripping became the unflagged default on the 22.x line in 22.18.0.
// A lower floor is the dangerous kind of wrong: on 22.12–22.17 the suite does
// not fail an assertion, it fails to load with ERR_UNKNOWN_FILE_EXTENSION.
const STRIPPING_UNFLAGGED_FROM: Version = [22, 18, 0];

function isAtLeast(actual: Version, floor: Version): boolean {
  for (let i = 0; i < floor.length; i++) {
    if (actual[i]! !== floor[i]!) return actual[i]! > floor[i]!;
  }
  return true;
}

test('the running Node erases type annotations without a flag', () => {
  // Asserted against the capability rather than against `process.versions.node`,
  // which carries a suffix on nightly and RC builds that no version comparison
  // should have to care about.
  assert.equal(
    process.features.typescript,
    'strip',
    `this suite runs .ts through \`node --test\` with no loader and no build step, ` +
      `which needs Node >= ${STRIPPING_UNFLAGGED_FROM.join('.')}; ` +
      `running ${process.versions.node}`,
  );
});

test('the floor declared in package.json is high enough to support that', () => {
  const manifestPath = join(import.meta.dirname, '..', 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    engines?: { node?: string };
  };

  const declared = manifest.engines?.node;
  assert.ok(declared, 'package.json must declare engines.node');

  // Only `>=X.Y.Z` is accepted. Narrowing the grammar is the point: this parses
  // one string we control, so anything else means someone changed the shape of
  // the range and should check whether this test still means what it says.
  const match = /^>=(\d+)\.(\d+)\.(\d+)$/.exec(declared);
  assert.ok(match, `expected engines.node to be a \`>=X.Y.Z\` range, got: ${declared}`);

  const floor: Version = [Number(match[1]), Number(match[2]), Number(match[3])];

  assert.ok(
    isAtLeast(floor, STRIPPING_UNFLAGGED_FROM),
    `engines.node is ${declared}, below the ${STRIPPING_UNFLAGGED_FROM.join('.')} ` +
      `needed for unflagged type-stripping`,
  );
});
