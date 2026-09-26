export const percentOf = (p: number, x: number) => (p * x) / 100
export const change = (from: number, to: number) => ((to - from) / from) * 100
export const round2 = (v: number) => Math.round(v * 100) / 100
