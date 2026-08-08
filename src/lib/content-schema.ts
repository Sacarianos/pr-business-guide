// Plain-zod schemas for content/*.yaml (0001, "Content collections with Zod
// schemas replace a hand-written validator"). Imports 'zod' directly rather
// than the `z` astro:content re-exports, so this module has no dependency on
// the astro:content virtual module and can be imported from node:test
// (G-05) and from the decision-tree module (G-06) without going through
// Astro's build pipeline. src/content.config.ts wraps these schemas with
// `defineCollection` for the astro:content loader.
import { z } from 'zod';

export const bilingual = z.object({
  es: z.string(),
  en: z.string(),
});
export type Bilingual = z.infer<typeof bilingual>;

// Sourcing is two orthogonal fields, not one scale (0001, "Sourcing is two
// orthogonal fields, not one scale"). `sourcing` is document provenance —
// primary/secondary/unverified, required on every claim so the build fails
// loudly on an unmarked claim (G-05) rather than letting it reach
// production silently. `practice` is separate: whether someone who files
// these permits weekly confirms or contradicts what the document says. A
// claim can be primary-sourced and practically wrong at the same time; that
// combination, `practice.status: contradicted`, is the most valuable
// content on the page and the UI must treat it as the most prominent state
// (G-15).
export const claimFields = {
  sourcing: z.enum(['primary', 'secondary', 'unverified']),
  practice: z
    .object({
      status: z.enum(['confirmed', 'contradicted', 'unknown']),
      by: z.string(),
      at: z.coerce.date(),
    })
    .optional(),
};

export const stepSchema = z.object({
  title: bilingual,
  agency: bilingual,
  timing: bilingual,
  cost: bilingual,
  note: bilingual,
  // `key` = nothing else can proceed without this step; `warn` = worth a
  // reader's attention; `stop` = hard blocker. Absent means routine.
  severity: z.enum(['key', 'warn', 'stop']).optional(),
  // Recurring duties (monthly IVU, annual CRIM) vs. one-time steps (G-13).
  recurring: z.boolean().default(false),
  // Steps are heterogeneous — actions, artifacts, recurring duties,
  // decisions — but typing them (Trámite / Obligación / Decisión) is
  // deferred (0001, "Step remains untyped, with a slot reserved"). Kept as
  // a free string so adding the enum later is additive, not a migration.
  kind: z.string().optional(),
  ...claimFields,
});
export type StepData = z.infer<typeof stepSchema>;

export const questionSchema = z.object({
  order: z.number().int(),
  label: bilingual,
  hint: bilingual.optional(),
  input: z.enum(['options', 'select', 'number']),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: bilingual,
      }),
    )
    .optional(),
});
export type QuestionData = z.infer<typeof questionSchema>;

export const municipioSchema = z.object({
  name: z.string(),
  rate: z.discriminatedUnion('type', [
    z.object({ type: z.literal('flat'), percent: z.number() }),
    z.object({
      type: z.literal('tiered'),
      tiers: z.array(
        z.object({
          upTo: z.number().nullable(), // null = top, unbounded tier
          percent: z.number(),
        }),
      ),
    }),
  ]),
  minimum: z.number().optional(),
  permits: z
    .object({
      delegated: z.boolean(),
      ogpe: z.boolean(),
    })
    .optional(),
  portal: bilingual.optional(),
  note: bilingual.optional(),
  ...claimFields,
});
export type MunicipioData = z.infer<typeof municipioSchema>;

export const incentiveSchema = z.object({
  title: bilingual,
  note: bilingual,
  ...claimFields,
});
export type IncentiveData = z.infer<typeof incentiveSchema>;

// "What I could not verify" (G-16). A gap is itself the disclosure that a
// claim is unverified, so it doesn't carry its own sourcing mark.
export const gapSchema = z.object({
  text: bilingual,
  relatesTo: z.string().optional(),
});
export type GapData = z.infer<typeof gapSchema>;
