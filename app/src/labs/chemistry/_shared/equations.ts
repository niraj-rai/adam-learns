import { parseFormula } from './quantities'

export type Equation = { reactants: string[]; products: string[] }

/** Count atoms on one side for the given coefficients. */
export function atomCounts(species: string[], coeffs: number[]) {
  const total: Record<string, number> = {}
  species.forEach((f, i) => {
    for (const [el, n] of Object.entries(parseFormula(f))) total[el] = (total[el] ?? 0) + n * coeffs[i]
  })
  return total
}

export function isBalanced(eq: Equation, coeffs: number[]) {
  const r = atomCounts(eq.reactants, coeffs.slice(0, eq.reactants.length))
  const p = atomCounts(eq.products, coeffs.slice(eq.reactants.length))
  const els = new Set([...Object.keys(r), ...Object.keys(p)])
  return [...els].every((el) => (r[el] ?? 0) === (p[el] ?? 0))
}

/** Smallest whole-number coefficients (each 1–max) that balance the equation, or null. */
export function solve(eq: Equation, max = 8): number[] | null {
  const n = eq.reactants.length + eq.products.length
  const c = Array(n).fill(1)
  const total = max ** n
  for (let k = 0; k < total; k++) {
    let x = k
    for (let i = 0; i < n; i++) { c[i] = (x % max) + 1; x = Math.floor(x / max) }
    if (isBalanced(eq, c)) return [...c]
  }
  return null
}

export const EQUATIONS: (Equation & { name: string; type: string })[] = [
  { name: 'Hydrogen burns', type: 'Combination', reactants: ['H2', 'O2'], products: ['H2O'] },
  { name: 'Magnesium ribbon burns', type: 'Combination', reactants: ['Mg', 'O2'], products: ['MgO'] },
  { name: 'Quicklime and water', type: 'Combination', reactants: ['CaO', 'H2O'], products: ['Ca(OH)2'] },
  { name: 'Heating limestone', type: 'Decomposition', reactants: ['CaCO3'], products: ['CaO', 'CO2'] },
  { name: 'Electrolysis of water', type: 'Decomposition', reactants: ['H2O'], products: ['H2', 'O2'] },
  { name: 'Iron nail in copper sulfate', type: 'Displacement', reactants: ['Fe', 'CuSO4'], products: ['FeSO4', 'Cu'] },
  { name: 'Zinc and acid', type: 'Displacement', reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'] },
  { name: 'Barium chloride and sodium sulfate', type: 'Double displacement', reactants: ['Na2SO4', 'BaCl2'], products: ['BaSO4', 'NaCl'] },
  { name: 'Methane (CNG) burns', type: 'Combustion (redox)', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'] },
  { name: 'Rusting of iron', type: 'Oxidation', reactants: ['Fe', 'O2'], products: ['Fe2O3'] },
  { name: 'Aluminium displaces iron (thermite)', type: 'Displacement (redox)', reactants: ['Al', 'Fe2O3'], products: ['Al2O3', 'Fe'] },
  { name: 'Photosynthesis', type: 'Endothermic', reactants: ['CO2', 'H2O'], products: ['C6H12O6', 'O2'] },
]
