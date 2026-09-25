export const cToF = (c: number) => (c * 9) / 5 + 32
export const fToC = (f: number) => ((f - 32) * 5) / 9
/** Kelvin, using the rounded 273 used in school textbooks (the exact value is 273.15). */
export const cToK = (c: number) => c + 273

export type Thermometer = { id: 'clinical' | 'lab' | 'digital'; name: string; min: number; max: number; step: number }
export const THERMOMETERS: Thermometer[] = [
  { id: 'clinical', name: 'Clinical thermometer', min: 35, max: 42, step: 0.1 },
  { id: 'lab', name: 'Laboratory thermometer', min: -10, max: 110, step: 1 },
  { id: 'digital', name: 'Digital thermometer', min: 32, max: 43, step: 0.1 },
]

/** Can this thermometer safely measure this temperature? */
export const inRange = (t: Thermometer, temp: number) => temp >= t.min && temp <= t.max
