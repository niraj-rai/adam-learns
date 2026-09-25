/** The first 20 elements. Mass number is for the most common isotope. */
export type Category = 'alkali metal' | 'alkaline earth metal' | 'metal' | 'metalloid' | 'non-metal' | 'halogen' | 'noble gas'

export type Element = {
  z: number
  symbol: string
  name: string
  mass: number
  group: number
  period: number
  category: Category
  state: 'solid' | 'liquid' | 'gas'
  fact: string
}

export const ELEMENTS: Element[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', mass: 1, group: 1, period: 1, category: 'non-metal', state: 'gas', fact: 'The lightest element. It makes up about 75% of the normal matter in the Universe, and the Sun is mostly hydrogen.' },
  { z: 2, symbol: 'He', name: 'Helium', mass: 4, group: 18, period: 1, category: 'noble gas', state: 'gas', fact: 'Lighter than air, so it fills party balloons. It was discovered in the Sun (1868, during a solar eclipse seen from Guntur, India!) before it was found on Earth.' },
  { z: 3, symbol: 'Li', name: 'Lithium', mass: 7, group: 1, period: 2, category: 'alkali metal', state: 'solid', fact: 'The lightest metal: it floats on oil! Used in phone and electric-vehicle batteries.' },
  { z: 4, symbol: 'Be', name: 'Beryllium', mass: 9, group: 2, period: 2, category: 'alkaline earth metal', state: 'solid', fact: 'Light but very stiff. Used in the mirrors of the James Webb Space Telescope.' },
  { z: 5, symbol: 'B', name: 'Boron', mass: 11, group: 13, period: 2, category: 'metalloid', state: 'solid', fact: 'Used in heat-resistant borosilicate glass (lab glassware) and as borax.' },
  { z: 6, symbol: 'C', name: 'Carbon', mass: 12, group: 14, period: 2, category: 'non-metal', state: 'solid', fact: 'The element of life! Diamond, graphite and the carbon in your body are all carbon.' },
  { z: 7, symbol: 'N', name: 'Nitrogen', mass: 14, group: 15, period: 2, category: 'non-metal', state: 'gas', fact: 'About 78% of the air. Farmers use nitrogen fertilisers to help crops grow.' },
  { z: 8, symbol: 'O', name: 'Oxygen', mass: 16, group: 16, period: 2, category: 'non-metal', state: 'gas', fact: 'About 21% of the air and needed for breathing and burning. Most of your body mass is oxygen (in water).' },
  { z: 9, symbol: 'F', name: 'Fluorine', mass: 19, group: 17, period: 2, category: 'halogen', state: 'gas', fact: 'The most reactive non-metal. Fluoride compounds in toothpaste protect teeth.' },
  { z: 10, symbol: 'Ne', name: 'Neon', mass: 20, group: 18, period: 2, category: 'noble gas', state: 'gas', fact: 'Glows bright orange-red in electric signs.' },
  { z: 11, symbol: 'Na', name: 'Sodium', mass: 23, group: 1, period: 3, category: 'alkali metal', state: 'solid', fact: 'Soft enough to cut with a knife and stored in kerosene. Half of table salt (NaCl).' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', mass: 24, group: 2, period: 3, category: 'alkaline earth metal', state: 'solid', fact: 'Burns with a dazzling white light. Chlorophyll in every green leaf has a magnesium atom at its centre.' },
  { z: 13, symbol: 'Al', name: 'Aluminium', mass: 27, group: 13, period: 3, category: 'metal', state: 'solid', fact: 'The most common metal in Earth’s crust. Used in foil, cans and aircraft.' },
  { z: 14, symbol: 'Si', name: 'Silicon', mass: 28, group: 14, period: 3, category: 'metalloid', state: 'solid', fact: 'Sand is mostly silicon dioxide. Silicon chips power every phone and computer.' },
  { z: 15, symbol: 'P', name: 'Phosphorus', mass: 31, group: 15, period: 3, category: 'non-metal', state: 'solid', fact: 'White phosphorus catches fire in air, so it is stored under water. Found in your bones and DNA.' },
  { z: 16, symbol: 'S', name: 'Sulfur', mass: 32, group: 16, period: 3, category: 'non-metal', state: 'solid', fact: 'A yellow solid. Burning it makes sulfur dioxide, a cause of acid rain.' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', mass: 35, group: 17, period: 3, category: 'halogen', state: 'gas', fact: 'A poisonous green gas, but tiny amounts kill germs in drinking water and swimming pools.' },
  { z: 18, symbol: 'Ar', name: 'Argon', mass: 40, group: 18, period: 3, category: 'noble gas', state: 'gas', fact: 'About 1% of the air. Used inside light bulbs because it doesn’t react.' },
  { z: 19, symbol: 'K', name: 'Potassium', mass: 39, group: 1, period: 4, category: 'alkali metal', state: 'solid', fact: 'Reacts with water so violently it catches fire. Bananas are rich in potassium compounds.' },
  { z: 20, symbol: 'Ca', name: 'Calcium', mass: 40, group: 2, period: 4, category: 'alkaline earth metal', state: 'solid', fact: 'Makes your bones and teeth strong. Chalk, marble and limestone are calcium carbonate.' },
]

export const getElement = (z: number) => ELEMENTS.find((e) => e.z === z)

export const CATEGORY_STYLE: Record<Category, { bg: string; label: string }> = {
  'alkali metal': { bg: '#fca5a5', label: 'Alkali metal' },
  'alkaline earth metal': { bg: '#fdba74', label: 'Alkaline earth metal' },
  metal: { bg: '#cbd5e1', label: 'Other metal' },
  metalloid: { bg: '#a7f3d0', label: 'Metalloid' },
  'non-metal': { bg: '#fde68a', label: 'Non-metal' },
  halogen: { bg: '#bef264', label: 'Halogen' },
  'noble gas': { bg: '#c4b5fd', label: 'Noble gas' },
}

/** Bohr-model shell arrangement for the first 20 elements: 2, 8, 8, 2. */
export function shells(electrons: number): number[] {
  const caps = [2, 8, 8, 2]
  const out: number[] = []
  let left = electrons
  for (const c of caps) {
    if (left <= 0) break
    out.push(Math.min(c, left))
    left -= c
  }
  return out
}

/** Valency for the first 20: electrons to lose or gain to reach a full outer shell. */
export function valency(z: number) {
  const s = shells(z)
  const outer = s[s.length - 1]
  const cap = s.length === 1 ? 2 : 8
  if (outer === cap) return 0
  return outer <= 4 ? outer : cap - outer
}
