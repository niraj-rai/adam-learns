/** Standard form a × 10ⁿ with 1 ≤ a < 10, rounded to `sig` significant figures. */
export function toSci(x: number, sig = 4) {
  if (x === 0) return { a: 0, n: 0 }
  let n = Math.floor(Math.log10(Math.abs(x)))
  let a = Number((x / 10 ** n).toPrecision(sig))
  if (Math.abs(a) >= 10) { a /= 10; n += 1 }
  return { a, n }
}
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
export const pow10 = (n: number) => `10${n < 0 ? '⁻' : ''}${String(Math.abs(n)).split('').map((d) => SUP[+d]).join('')}`
export const sci = (x: number, sig = 4) => { const { a, n } = toSci(x, sig); return `${a} × ${pow10(n)}` }

export const OBJECTS = [
  { name: 'Hydrogen atom (width)', emoji: '⚛️', m: 1.1e-10 },
  { name: 'Virus', emoji: '🦠', m: 1e-7 },
  { name: 'Red blood cell', emoji: '🩸', m: 7.5e-6 },
  { name: 'Human hair (width)', emoji: '💇', m: 7e-5 },
  { name: 'Ant', emoji: '🐜', m: 3e-3 },
  { name: 'Adam', emoji: '🧒', m: 1.6 },
  { name: 'Qutub Minar', emoji: '🗼', m: 73 },
  { name: 'Mount Everest', emoji: '🏔️', m: 8849 },
  { name: 'India, north to south', emoji: '🇮🇳', m: 3.214e6 },
  { name: 'Earth (diameter)', emoji: '🌍', m: 1.2742e7 },
  { name: 'Earth to Moon', emoji: '🌕', m: 3.844e8 },
  { name: 'Earth to Sun', emoji: '☀️', m: 1.496e11 },
  { name: 'One light year', emoji: '✨', m: 9.461e15 },
  { name: 'Milky Way (width)', emoji: '🌌', m: 9.5e20 },
  { name: 'Observable universe', emoji: '🔭', m: 8.8e26 },
]
