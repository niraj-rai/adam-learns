export type Law = 'multiply' | 'divide' | 'power'
export const resultExponent = (law: Law, m: number, n: number) => (law === 'multiply' ? m + n : law === 'divide' ? m - n : m * n)
