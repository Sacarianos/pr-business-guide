// G-17: the research document (docs/research/starting-a-business-in-puerto-
// rico.md) records its own compile date in prose ("Research date:
// 2026-08-06" / "Compiled 2026-08-06."). This constant is the single place
// that date is duplicated into code — a re-verification pass updates it
// here, and the masthead alert (src/pages/index.astro) picks it up, along
// with any other "read on the page" (0001, story 27).
export const RESEARCH_DATE = '2026-08-06';

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// G-19: defaults to Spanish, same reason sourcing-label.ts's functions do.
export function researchDateLabel(lang: 'es' | 'en' = 'es'): string {
  const [year, month, day] = RESEARCH_DATE.split('-').map(Number) as [number, number, number];
  return lang === 'en'
    ? `${MONTHS_EN[month - 1]} ${day}, ${year}`
    : `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}

// The short form, for the route's summary strip (0002, G-34), where the
// long form doesn't fit a quarter-width cell. Month abbreviations are
// spelled out here rather than taken from Intl, whose output varies by
// runtime and locale data.
const MONTHS_ES_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function researchDateShort(lang: 'es' | 'en' = 'es'): string {
  const [year, month, day] = RESEARCH_DATE.split('-').map(Number) as [number, number, number];
  return lang === 'en'
    ? `${MONTHS_EN_SHORT[month - 1]} ${day}, ${year}`
    : `${day} ${MONTHS_ES_SHORT[month - 1]} ${year}`;
}
