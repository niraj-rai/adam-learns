const rad = (deg: number) => (deg * Math.PI) / 180

/** sin, cos, tan and their reciprocals of an angle in degrees. tan 90° is undefined (Infinity). */
export function ratios(deg: number) {
  const s = Math.sin(rad(deg))
  const c = Math.cos(rad(deg))
  const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v)
  return { sin: clean(s), cos: clean(c), tan: deg === 90 ? Infinity : clean(s / c), cosec: s === 0 ? Infinity : 1 / s, sec: deg === 90 ? Infinity : 1 / c, cot: deg === 0 ? Infinity : c / s }
}

/** Exact values for the standard angles, as strings. */
export const STANDARD: Record<number, { sin: string; cos: string; tan: string }> = {
  0: { sin: '0', cos: '1', tan: '0' },
  30: { sin: '1/2', cos: '√3/2', tan: '1/√3' },
  45: { sin: '1/√2', cos: '1/√2', tan: '1' },
  60: { sin: '√3/2', cos: '1/2', tan: '√3' },
  90: { sin: '1', cos: '0', tan: 'not defined' },
}

/** Height of an object from horizontal distance d and angle of elevation (degrees), plus the observer's eye height. */
export const heightFromElevation = (d: number, deg: number, eye = 0) => d * Math.tan(rad(deg)) + eye
/** Horizontal distance from height h and angle of elevation or depression. */
export const distanceFromAngle = (h: number, deg: number) => h / Math.tan(rad(deg))
