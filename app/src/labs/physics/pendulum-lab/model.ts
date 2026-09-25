const G = 9.8

/** Time period (s) of a simple pendulum of the given length (cm), small-angle formula T = 2π√(L/g). */
export const periodOf = (lengthCm: number) => 2 * Math.PI * Math.sqrt(lengthCm / 100 / G)
