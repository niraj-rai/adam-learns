/** Grade 9 chemistry quantities: atomic masses, formulae, ions, the mole, concentration and solubility. */

/** Atomic masses (u), NCERT values. */
export const ATOMIC_MASS: Record<string, number> = {
  H: 1, He: 4, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, P: 31, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65, Ag: 108, Ba: 137, Pb: 207, Mn: 55, I: 127, Br: 80,
}
export const AVOGADRO = 6.022e23

/** Parse a formula like "Ca(OH)2" or "CuSO4·5H2O" (no hydrates) into element counts. */
export function parseFormula(formula: string): Record<string, number> {
  let i = 0
  const read = (): Record<string, number> => {
    const counts: Record<string, number> = {}
    const add = (el: string, n: number) => { counts[el] = (counts[el] ?? 0) + n }
    while (i < formula.length) {
      const ch = formula[i]
      if (ch === '(') {
        i++
        const inner = read()
        const n = readNumber()
        for (const [el, c] of Object.entries(inner)) add(el, c * n)
      } else if (ch === ')') {
        i++
        return counts
      } else if (/[A-Z]/.test(ch)) {
        let el = ch
        i++
        while (i < formula.length && /[a-z]/.test(formula[i])) el += formula[i++]
        if (!(el in ATOMIC_MASS)) throw new Error(`Unknown element ${el}`)
        add(el, readNumber())
      } else throw new Error(`Unexpected "${ch}" in ${formula}`)
    }
    return counts
  }
  const readNumber = () => {
    let s = ''
    while (i < formula.length && /\d/.test(formula[i])) s += formula[i++]
    return s ? Number(s) : 1
  }
  return read()
}

export const molarMass = (formula: string) =>
  Object.entries(parseFormula(formula)).reduce((sum, [el, n]) => sum + ATOMIC_MASS[el] * n, 0)

export const moles = (mass: number, M: number) => mass / M
export const massFromMoles = (n: number, M: number) => n * M
export const particles = (n: number) => n * AVOGADRO

/** Pretty subscripts: H2O → H₂O. */
export const pretty = (formula: string) => formula.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])

export type Ion = { name: string; formula: string; charge: number; poly?: boolean }
export const CATIONS: Ion[] = [
  { name: 'Sodium', formula: 'Na', charge: 1 },
  { name: 'Potassium', formula: 'K', charge: 1 },
  { name: 'Ammonium', formula: 'NH4', charge: 1, poly: true },
  { name: 'Magnesium', formula: 'Mg', charge: 2 },
  { name: 'Calcium', formula: 'Ca', charge: 2 },
  { name: 'Copper(II)', formula: 'Cu', charge: 2 },
  { name: 'Zinc', formula: 'Zn', charge: 2 },
  { name: 'Iron(III)', formula: 'Fe', charge: 3 },
  { name: 'Aluminium', formula: 'Al', charge: 3 },
]
export const ANIONS: Ion[] = [
  { name: 'Chloride', formula: 'Cl', charge: -1 },
  { name: 'Hydroxide', formula: 'OH', charge: -1, poly: true },
  { name: 'Nitrate', formula: 'NO3', charge: -1, poly: true },
  { name: 'Oxide', formula: 'O', charge: -2 },
  { name: 'Sulfide', formula: 'S', charge: -2 },
  { name: 'Sulfate', formula: 'SO4', charge: -2, poly: true },
  { name: 'Carbonate', formula: 'CO3', charge: -2, poly: true },
  { name: 'Phosphate', formula: 'PO4', charge: -3, poly: true },
]

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

/** Criss-cross the valencies and simplify: Al³⁺ + O²⁻ → Al2O3. */
export function ionicFormula(cat: Ion, an: Ion) {
  let nc = Math.abs(an.charge)
  let na = Math.abs(cat.charge)
  const g = gcd(nc, na)
  nc /= g
  na /= g
  const part = (ion: Ion, n: number) => (n === 1 ? ion.formula : ion.poly ? `(${ion.formula})${n}` : `${ion.formula}${n}`)
  return { formula: part(cat, nc) + part(an, na), cations: nc, anions: na }
}

/** Concentration of a solution, in percent. */
export const massByMass = (soluteG: number, solventG: number) => (100 * soluteG) / (soluteG + solventG)
export const massByVolume = (soluteG: number, solutionMl: number) => (100 * soluteG) / solutionMl
export const volumeByVolume = (soluteMl: number, solutionMl: number) => (100 * soluteMl) / solutionMl

/** Solubility in g per 100 g of water at 0, 10, …, 100 °C (approximate textbook data). */
export const SOLUBILITY: Record<string, { name: string; data: number[]; colour: string }> = {
  KNO3: { name: 'Potassium nitrate', data: [13, 21, 32, 46, 64, 85, 106, 138, 169, 202, 246], colour: '#6366f1' },
  NaCl: { name: 'Sodium chloride (salt)', data: [35.7, 35.8, 36, 36.3, 36.6, 37, 37.3, 37.8, 38.4, 39, 39.8], colour: '#10b981' },
  KCl: { name: 'Potassium chloride', data: [28, 31, 34, 37, 40, 43, 46, 48, 51, 54, 56], colour: '#f59e0b' },
  CuSO4: { name: 'Copper sulfate', data: [14, 17, 21, 25, 29, 33, 40, 47, 55, 64, 75], colour: '#0ea5e9' },
}

export function solubilityAt(key: string, tempC: number) {
  const d = SOLUBILITY[key].data
  const t = Math.max(0, Math.min(100, tempC)) / 10
  const i = Math.min(9, Math.floor(t))
  return d[i] + (d[i + 1] - d[i]) * (t - i)
}

/** Hydrogen + oxygen → water always in the fixed mass ratio 1 : 8 (law of constant proportions). */
export function makeWater(hG: number, oG: number) {
  const usedH = Math.min(hG, oG / 8)
  const usedO = usedH * 8
  return { water: usedH + usedO, leftH: hG - usedH, leftO: oG - usedO }
}
