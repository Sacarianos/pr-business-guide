// Content collections, per 0001 ("Content collections with Zod schemas replace
// a hand-written validator"). Data lives in `content/*.yaml` at the repo root
// (published as `content.json` for cud-agente, G-04) rather than under
// `src/content/`, so the loader points there explicitly.
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const bilingual = z.object({
  es: z.string(),
  en: z.string(),
});

// Sourcing is two orthogonal fields, not one scale (0001, "Sourcing is two
// orthogonal fields, not one scale"). `sourcing` is document provenance —
// primary/secondary/unverified. `practice` is separate: whether someone who
// files these permits weekly confirms or contradicts what the document says.
// A claim can be primary-sourced and practically wrong at the same time; that
// combination, `practice.status: contradicted`, is the most valuable content
// on the page and the UI must treat it as the most prominent state (G-15).
const claim = {
  sourcing: z.enum(['primary', 'secondary', 'unverified']),
  practice: z
    .object({
      status: z.enum(['confirmed', 'contradicted', 'unknown']),
      by: z.string(),
      at: z.coerce.date(),
    })
    .optional(),
};

const steps = defineCollection({
  loader: file('content/steps.yaml'),
  schema: z.object({
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
    ...claim,
  }),
});

const questions = defineCollection({
  loader: file('content/questions.yaml'),
  schema: z.object({
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
  }),
});

const municipios = defineCollection({
  loader: file('content/municipios.yaml'),
  schema: z.object({
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
    ...claim,
  }),
});

const incentives = defineCollection({
  loader: file('content/incentives.yaml'),
  schema: z.object({
    title: bilingual,
    note: bilingual,
    ...claim,
  }),
});

// "What I could not verify" (G-16). A gap is itself the disclosure that a
// claim is unverified, so it doesn't carry its own sourcing mark.
const gaps = defineCollection({
  loader: file('content/gaps.yaml'),
  schema: z.object({
    text: bilingual,
    relatesTo: z.string().optional(),
  }),
});

export const collections = { steps, questions, municipios, incentives, gaps };
