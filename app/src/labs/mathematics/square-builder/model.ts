/** Which odd "L-shaped layer" (1-based) a dot at row r, column c belongs to in an n × n square. */
export const layerOf = (r: number, c: number) => Math.max(r, c) + 1
export const oddSum = (n: number) => Array.from({ length: n }, (_, k) => 2 * k + 1)
export const lastDigit = (n: number) => (n * n) % 10
/** The last digits a perfect square can end in. */
export const SQUARE_ENDINGS = [...new Set(Array.from({ length: 10 }, (_, d) => lastDigit(d)))].sort()
