// Content collections, per 0001 ("Content collections with Zod schemas replace
// a hand-written validator"). Data lives in `content/*.yaml` at the repo root
// (published as `content.json` for cud-agente, G-04) rather than under
// `src/content/`, so the loader points there explicitly.
//
// The schemas themselves live in `src/lib/content-schema.ts` as plain zod,
// not redefined here — that lets node:test (G-05) and the decision-tree
// module (G-06) import and exercise them without going through the
// astro:content virtual module. This file only wires them into Astro's
// collection loader.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import {
  stepSchema,
  questionSchema,
  municipioSchema,
  incentiveSchema,
  gapSchema,
  entityFormSchema,
} from './lib/content-schema';

const steps = defineCollection({
  loader: file('content/steps.yaml'),
  schema: stepSchema,
});

const questions = defineCollection({
  loader: file('content/questions.yaml'),
  schema: questionSchema,
});

const municipios = defineCollection({
  loader: file('content/municipios.yaml'),
  schema: municipioSchema,
});

const incentives = defineCollection({
  loader: file('content/incentives.yaml'),
  schema: incentiveSchema,
});

const gaps = defineCollection({
  loader: file('content/gaps.yaml'),
  schema: gapSchema,
});

const entities = defineCollection({
  loader: file('content/entities.yaml'),
  schema: entityFormSchema,
});

export const collections = { steps, questions, municipios, incentives, gaps, entities };
