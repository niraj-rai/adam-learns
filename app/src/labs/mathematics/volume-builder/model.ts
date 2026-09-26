export const cuboidVolume = (l: number, b: number, h: number) => l * b * h
export const cylinderVolume = (r: number, h: number, pi = Math.PI) => pi * r * r * h
/** 1 litre = 1000 cm³ */
export const litres = (cm3: number) => cm3 / 1000
