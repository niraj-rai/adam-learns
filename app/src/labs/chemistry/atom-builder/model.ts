import { getElement } from '../../_kit/elements'

export type Atom = { p: number; n: number; e: number }

export type Challenge = { id: string; title: string; target: Atom; hint: string; set: 'basic' | 'isotopes' }

export const CHALLENGES: Challenge[] = [
  { id: 'h', title: 'A neutral hydrogen atom', target: { p: 1, n: 0, e: 1 }, hint: 'Hydrogen is the only atom with no neutrons.', set: 'basic' },
  { id: 'he', title: 'A neutral helium atom (helium-4)', target: { p: 2, n: 2, e: 2 }, hint: 'Mass number 4 = protons + neutrons.', set: 'basic' },
  { id: 'c12', title: 'A neutral carbon-12 atom', target: { p: 6, n: 6, e: 6 }, hint: 'Carbon is element 6.', set: 'basic' },
  { id: 'o16', title: 'A neutral oxygen-16 atom', target: { p: 8, n: 8, e: 8 }, hint: 'Oxygen is element 8.', set: 'basic' },
  { id: 'na', title: 'A sodium ion, Na⁺ (sodium-23)', target: { p: 11, n: 12, e: 10 }, hint: 'A + ion has LOST one electron.', set: 'basic' },
  { id: 'cl', title: 'A chloride ion, Cl⁻ (chlorine-35)', target: { p: 17, n: 18, e: 18 }, hint: 'A − ion has GAINED one electron.', set: 'basic' },
  { id: 'd', title: 'Deuterium (hydrogen-2), used in nuclear research', target: { p: 1, n: 1, e: 1 }, hint: 'Same protons as hydrogen, one extra neutron.', set: 'isotopes' },
  { id: 'c14', title: 'Carbon-14, used to date ancient objects', target: { p: 6, n: 8, e: 6 }, hint: 'Still carbon (6 protons), but mass number 14.', set: 'isotopes' },
  { id: 'cl37', title: 'Chlorine-37', target: { p: 17, n: 20, e: 17 }, hint: '37 − 17 = ?', set: 'isotopes' },
  { id: 'mg26', title: 'Neutral magnesium-26', target: { p: 12, n: 14, e: 12 }, hint: 'Magnesium is element 12.', set: 'isotopes' },
]

export function describe(a: Atom) {
  const el = getElement(a.p)
  const massNumber = a.p + a.n
  const charge = a.p - a.e
  const commonN = el ? el.mass - el.z : null
  const isotopeNote =
    !el || a.p === 0
      ? null
      : a.n === commonN
        ? 'the most common isotope'
        : Math.abs(a.n - (commonN ?? 0)) <= 2
          ? 'a less common isotope'
          : 'an unusual isotope (probably unstable, i.e. radioactive)'
  const chargeLabel = charge === 0 ? 'neutral atom' : charge > 0 ? `positive ion (${charge}+)` : `negative ion (${-charge}−)`
  return { el, massNumber, charge, chargeLabel, isotopeNote }
}

export const matches = (a: Atom, t: Atom) => a.p === t.p && a.n === t.n && a.e === t.e
