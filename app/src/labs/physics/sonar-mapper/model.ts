/** Speed of sound in sea water (m/s). */
export const V_SEA = 1500

/** Seabed depths (m) along the survey line. One position hides a shipwreck: it is shallower than both neighbours. */
export const SEABED = [120, 135, 150, 165, 180, 142, 190, 205, 212, 220]
export const WRECK = 5

export const echoTime = (depth: number) => (2 * depth) / V_SEA
export const depthFrom = (seconds: number) => (V_SEA * seconds) / 2
/** Accept answers within 2% (the echo time is rounded to 3 decimal places). */
export const closeEnough = (answer: number, truth: number) => Math.abs(answer - truth) / truth <= 0.02
