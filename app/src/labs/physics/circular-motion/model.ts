/** Speed of uniform circular motion: one circumference per period. */
export const circularSpeed = (r: number, T: number) => (2 * Math.PI * r) / T
export const centripetalAccel = (v: number, r: number) => (v * v) / r
