/** A trolley pulled along a 2 m track by a constant force, timed between two light gates. */
export const TRACK_M = 2

export const timeToCross = (a: number, d = TRACK_M) => Math.sqrt((2 * d) / a)
/** What a student would work out from the timing: s = ½at², so a = 2s ÷ t². */
export const accelFromTime = (t: number, d = TRACK_M) => (2 * d) / (t * t)

export type Trial = { force: number; mass: number; time: number; a: number }

export function runTrial(force: number, mass: number): Trial {
  const time = timeToCross(force / mass)
  return { force, mass, time, a: accelFromTime(time) }
}
