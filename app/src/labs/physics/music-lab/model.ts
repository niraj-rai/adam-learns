/** Struck bowl (jal tarang): more water makes the bowl vibrate more slowly, giving a LOWER pitch. fill is 0–1. */
export const bowlFreq = (fill: number) => 560 * (1 - 0.55 * fill)

/** Fill level needed for a bowl to sound at frequency f (clamped to 0–1). */
export const fillFor = (f: number) => Math.min(1, Math.max(0, (1 - f / 560) / 0.55))

/** Stretched string: f = (1 / 2L) × √(T / μ). L in metres, T in newtons, μ in kg per metre. */
export const stringFreq = (lengthM: number, tensionN: number, mu = 0.001) => (1 / (2 * lengthM)) * Math.sqrt(tensionN / mu)

/** Bottle of height 0.25 m. Tapping: more water → lower pitch. Blowing across the top: the air column is shorter → HIGHER pitch. */
export const tapFreq = (fill: number) => 900 * (1 - 0.5 * fill)
export const blowFreq = (fill: number, heightM = 0.25) => 343 / (4 * heightM * Math.max(0.1, 1 - fill))

/** Indian sargam (Sa to upper Sa), using equal-tempered notes from C4. */
export const SARGAM = [
  { name: 'Sa', f: 261.63 },
  { name: 'Re', f: 293.66 },
  { name: 'Ga', f: 329.63 },
  { name: 'Ma', f: 349.23 },
  { name: 'Pa', f: 392.0 },
  { name: 'Dha', f: 440.0 },
  { name: 'Ni', f: 493.88 },
  { name: 'Sa′', f: 523.25 },
]

/** In tune if within 2% of the target. */
export const inTune = (f: number, target: number) => Math.abs(f - target) / target < 0.02
