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

export function researchDateLabel(): string {
  const [year, month, day] = RESEARCH_DATE.split('-').map(Number) as [number, number, number];
  return `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}
