export const simpleAmount = (p: number, r: number, t: number) => p * (1 + (r * t) / 100)
export const compoundAmount = (p: number, r: number, t: number, perYear = 1) => p * (1 + r / 100 / perYear) ** (t * perYear)
export const depreciate = (p: number, r: number, t: number) => p * (1 - r / 100) ** t
export const money = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`
