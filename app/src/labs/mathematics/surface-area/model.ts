export const cuboidSA = (l: number, b: number, h: number) => 2 * (l * b + b * h + h * l)
export const cylinderCSA = (r: number, h: number, pi = Math.PI) => 2 * pi * r * h
export const cylinderTSA = (r: number, h: number, pi = Math.PI) => 2 * pi * r * (r + h)
