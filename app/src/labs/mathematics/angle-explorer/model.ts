/** Two parallel lines (A on top, B below) cut by a transversal that makes angle θ with them. */
export type Pos = 'TL' | 'TR' | 'BL' | 'BR'
export type Corner = { at: 'A' | 'B'; pos: Pos }
export const angle = (theta: number, pos: Pos) => (pos === 'TR' || pos === 'BL' ? theta : 180 - theta)

export type Relation = { id: string; name: string; rule: string; pairs: [Corner, Corner][] }
const C = (at: 'A' | 'B', pos: Pos): Corner => ({ at, pos })
export const RELATIONS: Relation[] = [
  { id: 'vertical', name: 'Vertically opposite', rule: 'equal', pairs: [[C('A', 'TR'), C('A', 'BL')], [C('A', 'TL'), C('A', 'BR')], [C('B', 'TR'), C('B', 'BL')], [C('B', 'TL'), C('B', 'BR')]] },
  { id: 'corresponding', name: 'Corresponding', rule: 'equal', pairs: (['TL', 'TR', 'BL', 'BR'] as Pos[]).map((p) => [C('A', p), C('B', p)] as [Corner, Corner]) },
  { id: 'alternate', name: 'Alternate interior', rule: 'equal', pairs: [[C('A', 'BL'), C('B', 'TR')], [C('A', 'BR'), C('B', 'TL')]] },
  { id: 'cointerior', name: 'Co-interior (same side)', rule: 'add to 180°', pairs: [[C('A', 'BL'), C('B', 'TL')], [C('A', 'BR'), C('B', 'TR')]] },
  { id: 'linear', name: 'Linear pair', rule: 'add to 180°', pairs: [[C('A', 'TL'), C('A', 'TR')], [C('B', 'BL'), C('B', 'BR')]] },
]
