export type Case = { code: string; given: string; example: string; ok: boolean; why: string }
export const CASES: Case[] = [
  { code: 'SSS', given: 'All three sides equal', example: 'AB = 5, BC = 6, CA = 7 in both triangles', ok: true, why: 'Three fixed lengths can only make one triangle shape.' },
  { code: 'SAS', given: 'Two sides and the angle between them', example: 'AB = 5, ∠B = 60°, BC = 6 in both', ok: true, why: 'The angle fixes how the two sides are hinged, so the third side is fixed.' },
  { code: 'ASA', given: 'Two angles and the side between them', example: '∠A = 50°, AB = 7, ∠B = 70° in both', ok: true, why: 'The side and its two end angles fix where the other lines meet.' },
  { code: 'AAS', given: 'Two angles and a side not between them', example: '∠A = 50°, ∠B = 70°, BC = 6 in both', ok: true, why: 'The third angle is fixed (180° − the other two), so this becomes ASA.' },
  { code: 'RHS', given: 'Right angle, hypotenuse and one side', example: '∠C = 90°, AB = 13, BC = 5 in both', ok: true, why: 'Pythagoras fixes the third side, so this becomes SSS.' },
  { code: 'AAA', given: 'All three angles equal', example: '∠A = 40°, ∠B = 60°, ∠C = 80° in both', ok: false, why: 'Same shape, but it can be any size: an enlargement has the same angles. These are similar, not congruent.' },
  { code: 'SSA', given: 'Two sides and an angle NOT between them', example: 'AB = 8, BC = 6, ∠A = 40° in both', ok: false, why: 'The side opposite the angle can swing into two different positions, giving two different triangles.' },
]
