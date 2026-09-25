/**
 * Simple energy-balance model of a planet around a Sun-like star.
 * Without an atmosphere: T ≈ 278 K × (1 − albedo)^¼ ÷ √(distance in AU).
 * A greenhouse atmosphere adds warming (Earth's natural greenhouse effect is about +33 °C).
 */
export function surfaceTempC(au: number, albedo: number, greenhouseC: number) {
  const k = 278 * Math.pow(1 - albedo, 0.25) / Math.sqrt(au)
  return k - 273 + greenhouseC
}

export const waterState = (tC: number) => (tC < 0 ? 'ice' : tC < 100 ? 'liquid water' : 'steam')

export const ATMOSPHERES = [
  { id: 'none', name: 'No atmosphere (like the Moon)', greenhouse: 0 },
  { id: 'thin', name: 'Thin atmosphere (like Mars)', greenhouse: 5 },
  { id: 'earth', name: 'Earth-like atmosphere', greenhouse: 33 },
  { id: 'thick', name: 'Thick CO₂ atmosphere (like Venus)', greenhouse: 500 },
]
