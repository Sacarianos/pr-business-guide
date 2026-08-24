// G-19: the ES/EN toggle. index.astro's inline flash-prevention script
// already applied a saved preference to `document.documentElement.dataset
// .lang` before this module runs — that attribute is what src/pages/
// index.astro's CSS keys every `[lang="es"]`/`[lang="en"]` pair on to show
// or hide the right one. This module only owns the interactive half: the
// button clicks, persistence, and telling src/scripts/tool.ts (which can't
// use the CSS technique — a `<select><option>`'s text and an `aria-label`
// can't hold a hidden alternate-language span) that the language changed.
export type Lang = 'es' | 'en';

const STORAGE_KEY = 'pr-guia-lang';

export function currentLang(): Lang {
  return document.documentElement.dataset.lang === 'en' ? 'en' : 'es';
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-lang-option]');

// `aria-label` can't hold two languages the way a paired `[lang]` span
// can — anything that needs a translated aria-label (ProcessDiagram.astro's
// SVG, so far) carries the two candidates in `data-aria-es`/`data-aria-en`
// and gets updated here directly, on every toggle.
function applyAriaLabels(lang: Lang): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-aria-es]')) {
    const label = lang === 'en' ? el.dataset.ariaEn : el.dataset.ariaEs;
    if (label) el.setAttribute('aria-label', label);
  }
}

function setLang(lang: Lang): void {
  document.documentElement.dataset.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Private browsing / storage disabled — the toggle still works for the
    // rest of this page view, it just won't persist across a reload.
  }
  for (const btn of buttons) {
    btn.setAttribute('aria-pressed', String(btn.dataset.langOption === lang));
  }
  applyAriaLabels(lang);
  document.dispatchEvent(new CustomEvent<Lang>('langchange', { detail: lang }));
}

// The inline flash-prevention script (index.astro, in <head>) already set
// `data-lang` before paint, but that only drives the CSS-toggled `[lang]`
// pairs — aria-labels need this explicit pass too, in case the saved
// preference was already 'en' on load.
applyAriaLabels(currentLang());

for (const btn of buttons) {
  btn.setAttribute('aria-pressed', String(btn.dataset.langOption === currentLang()));
  btn.addEventListener('click', () => {
    const lang = btn.dataset.langOption as Lang;
    if (lang !== currentLang()) setLang(lang);
  });
}
