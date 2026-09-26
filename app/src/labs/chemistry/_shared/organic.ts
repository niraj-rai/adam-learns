export const PREFIX = ['', 'meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec']

export type Family = 'alkane' | 'alkene' | 'alkyne'
/** Molecular formula counts for a straight chain of n carbons. */
export function hydrocarbon(n: number, fam: Family) {
  const H = fam === 'alkane' ? 2 * n + 2 : fam === 'alkene' ? 2 * n : 2 * n - 2
  const name = PREFIX[n] + (fam === 'alkane' ? 'ane' : fam === 'alkene' ? 'ene' : 'yne')
  return { C: n, H, name, formula: `C${n > 1 ? n : ''}H${H}` }
}

export type Group = 'none' | 'alcohol' | 'aldehyde' | 'ketone' | 'acid' | 'chloro'
/** IUPAC-style names for simple straight-chain compounds with one functional group (NCERT level). */
export function organicName(n: number, g: Group) {
  const stem = PREFIX[n]
  switch (g) {
    case 'none': return `${stem}ane`
    case 'alcohol': return `${stem}anol`
    case 'aldehyde': return `${stem}anal`
    case 'ketone': return n >= 3 ? `${stem}anone` : null
    case 'acid': return `${stem}anoic acid`
    case 'chloro': return `chloro${stem}ane`
  }
}
