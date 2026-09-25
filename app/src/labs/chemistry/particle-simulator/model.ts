export type Substance = {
  id: string
  name: string
  formula: string
  /** melting point °C (for sublimers: sublimation point) */
  mp: number
  /** boiling point °C (equal to mp for sublimers) */
  bp: number
  tMin: number
  tMax: number
  sublimes?: boolean
  color: string
  names: { solid: string; liquid: string; gas: string }
  fact: string
}

export const SUBSTANCES: Substance[] = [
  {
    id: 'water',
    name: 'Water',
    formula: 'H₂O',
    mp: 0,
    bp: 100,
    tMin: -40,
    tMax: 140,
    color: '#38bdf8',
    names: { solid: 'Ice', liquid: 'Water', gas: 'Steam (water vapour)' },
    fact: 'Water is the only common substance you meet as a solid, a liquid and a gas in everyday life.',
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    mp: -114,
    bp: 78,
    tMin: -150,
    tMax: 120,
    color: '#a78bfa',
    names: { solid: 'Solid ethanol', liquid: 'Liquid ethanol', gas: 'Ethanol vapour' },
    fact: 'Ethanol boils at 78 °C. That is why hand sanitiser evaporates so quickly from your skin.',
  },
  {
    id: 'oxygen',
    name: 'Oxygen',
    formula: 'O₂',
    mp: -218,
    bp: -183,
    tMin: -240,
    tMax: 30,
    color: '#f87171',
    names: { solid: 'Solid oxygen', liquid: 'Liquid oxygen', gas: 'Oxygen gas' },
    fact: 'Oxygen is a gas at room temperature because it boils at −183 °C. Liquid oxygen is used as rocket fuel by ISRO.',
  },
  {
    id: 'iron',
    name: 'Iron',
    formula: 'Fe',
    mp: 1538,
    bp: 2862,
    tMin: 25,
    tMax: 3100,
    color: '#94a3b8',
    names: { solid: 'Solid iron', liquid: 'Molten iron', gas: 'Iron vapour' },
    fact: 'Iron melts at 1538 °C, so steel plants need huge blast furnaces to shape it.',
  },
  {
    id: 'dry-ice',
    name: 'Carbon dioxide',
    formula: 'CO₂',
    mp: -78.5,
    bp: -78.5,
    tMin: -120,
    tMax: 25,
    sublimes: true,
    color: '#cbd5e1',
    names: { solid: 'Dry ice', liquid: '—', gas: 'Carbon dioxide gas' },
    fact: 'Dry ice skips the liquid state completely at normal pressure. It sublimes straight into a gas.',
  },
]

export type Phase = 'solid' | 'liquid' | 'gas'

/**
 * Heating is modelled as an "energy" value H (in seconds of heating at full power).
 * Each segment: warming the solid, melting, warming the liquid, boiling, warming the gas.
 * Temperature is flat during melting and boiling. This is the key idea of the heating curve.
 */
const SEG = { solid: 5, melt: 4, liquid: 7, boil: 7, gas: 4 }

export function segments(s: Substance) {
  if (s.sublimes) {
    return [
      { kind: 'solid' as const, len: SEG.solid },
      { kind: 'melt' as const, len: 0 },
      { kind: 'liquid' as const, len: 0 },
      { kind: 'boil' as const, len: SEG.boil },
      { kind: 'gas' as const, len: SEG.gas },
    ]
  }
  return [
    { kind: 'solid' as const, len: SEG.solid },
    { kind: 'melt' as const, len: SEG.melt },
    { kind: 'liquid' as const, len: SEG.liquid },
    { kind: 'boil' as const, len: SEG.boil },
    { kind: 'gas' as const, len: SEG.gas },
  ]
}

export const maxEnergy = (s: Substance) => segments(s).reduce((a, x) => a + x.len, 0)

export type ThermalState = {
  temperature: number
  /** fraction of particles no longer solid (0–1) */
  meltFrac: number
  /** fraction of particles that are gas (0–1) */
  gasFrac: number
}

export function stateFromEnergy(s: Substance, H: number): ThermalState {
  const segs = segments(s)
  let h = Math.max(0, Math.min(H, maxEnergy(s)))
  const [solid, melt, liquid, boil, gas] = segs
  if (h <= solid.len) return { temperature: s.tMin + (s.mp - s.tMin) * (h / solid.len), meltFrac: 0, gasFrac: 0 }
  h -= solid.len
  if (melt.len > 0 && h <= melt.len) return { temperature: s.mp, meltFrac: h / melt.len, gasFrac: 0 }
  h -= melt.len
  if (liquid.len > 0 && h <= liquid.len) return { temperature: s.mp + (s.bp - s.mp) * (h / liquid.len), meltFrac: 1, gasFrac: 0 }
  h -= liquid.len
  if (h <= boil.len) {
    const f = h / boil.len
    return { temperature: s.bp, meltFrac: s.sublimes ? f : 1, gasFrac: f }
  }
  h -= boil.len
  return { temperature: s.bp + (s.tMax - s.bp) * Math.min(1, h / gas.len), meltFrac: 1, gasFrac: 1 }
}

/** Inverse of stateFromEnergy for the temperature slider. Exactly at a transition point → halfway through it. */
export function energyFromTemperature(s: Substance, T: number): number {
  const [solid, melt, liquid, boil, gas] = segments(s)
  const t = Math.max(s.tMin, Math.min(T, s.tMax))
  if (t < s.mp) return (solid.len * (t - s.tMin)) / (s.mp - s.tMin)
  if (t === s.mp && !s.sublimes) return solid.len + melt.len / 2
  if (s.sublimes && t === s.mp) return solid.len + boil.len / 2
  if (t < s.bp) return solid.len + melt.len + (liquid.len * (t - s.mp)) / (s.bp - s.mp)
  if (t === s.bp) return solid.len + melt.len + liquid.len + boil.len / 2
  return solid.len + melt.len + liquid.len + boil.len + (gas.len * (t - s.bp)) / (s.tMax - s.bp)
}

export function phaseLabel(s: Substance, st: ThermalState): { phase: string; detail: string } {
  if (st.gasFrac > 0 && st.gasFrac < 1) {
    return s.sublimes
      ? { phase: 'Subliming', detail: 'Solid is turning straight into gas. Temperature stays constant.' }
      : { phase: 'Boiling', detail: 'Liquid is turning into gas. Temperature stays constant.' }
  }
  if (st.meltFrac > 0 && st.meltFrac < 1) {
    return { phase: 'Melting / freezing', detail: 'Solid and liquid together. Temperature stays constant.' }
  }
  if (st.gasFrac === 1) return { phase: 'Gas', detail: 'Particles are far apart and move fast in all directions.' }
  if (st.meltFrac === 1) return { phase: 'Liquid', detail: 'Particles touch but slide past each other.' }
  return { phase: 'Solid', detail: 'Particles are packed in fixed positions and vibrate.' }
}

/** 0–1 position of the temperature inside the current phase range; drives how fast particles move. */
export function agitation(s: Substance, T: number, phase: Phase) {
  const clamp = (x: number) => Math.max(0, Math.min(1, x))
  if (phase === 'solid') return clamp((T - s.tMin) / (s.mp - s.tMin))
  if (phase === 'liquid') return clamp((T - s.mp) / Math.max(1, s.bp - s.mp))
  return clamp((T - s.bp) / Math.max(1, s.tMax - s.bp))
}
