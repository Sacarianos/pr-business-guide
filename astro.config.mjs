// @ts-check
import { defineConfig } from 'astro/config';

// Static output is a product decision, not a default: the guide must be fully
// usable before any JavaScript loads (0001, user story 35). The only hydrated
// component on the page will be the chat island (G-21).
//
// G-24: published as a GitHub Pages project page, so `base` has to match the
// repository name. Astro prefixes every bundled asset with it; a wrong value
// breaks every asset URL silently, which is why test/built-page.test.ts
// checks the built page's asset URLs against it.
export default defineConfig({
  output: 'static',
  site: 'https://sacarianos.github.io',
  base: '/pr-business-guide',
});
