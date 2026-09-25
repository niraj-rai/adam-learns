/** Refractive index of crown glass for each colour (violet bends most, red least). */
export const SPECTRUM = [
  { name: 'Red', colour: '#ef4444', n: 1.513 },
  { name: 'Orange', colour: '#f97316', n: 1.515 },
  { name: 'Yellow', colour: '#eab308', n: 1.517 },
  { name: 'Green', colour: '#22c55e', n: 1.519 },
  { name: 'Blue', colour: '#3b82f6', n: 1.523 },
  { name: 'Indigo', colour: '#4f46e5', n: 1.526 },
  { name: 'Violet', colour: '#8b5cf6', n: 1.53 },
]

/** Deviation (degrees) of a ray through a thin prism of apex angle A: δ ≈ (n − 1) A. */
export const deviation = (n: number, apexDeg: number) => (n - 1) * apexDeg

/** Colours of light that a filter lets through (simplified primary-colour filters). */
export function throughFilter(filter: 'none' | 'red' | 'green' | 'blue') {
  if (filter === 'none') return SPECTRUM.map((c) => c.name)
  if (filter === 'red') return ['Red', 'Orange']
  if (filter === 'green') return ['Yellow', 'Green']
  return ['Blue', 'Indigo', 'Violet']
}
