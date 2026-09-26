import { G_EARTH } from '../_shared/dynamics'

export type World = { id: string; name: string; emoji: string; g: number }

/** Surface gravity in N/kg (rounded, from NASA planetary fact sheets). */
export const WORLDS: World[] = [
  { id: 'moon', name: 'Moon', emoji: '🌙', g: 1.6 },
  { id: 'mars', name: 'Mars', emoji: '🔴', g: 3.7 },
  { id: 'earth', name: 'Earth', emoji: '🌍', g: G_EARTH },
  { id: 'jupiter', name: 'Jupiter', emoji: '🪐', g: 24.8 },
]

/** How high you could jump, if you can jump h metres on Earth: the same take-off speed, so h ∝ 1/g. */
export const jumpHeight = (hEarth: number, g: number) => (hEarth * G_EARTH) / g

/** A 'weight' in kg-units as a bathroom scale calibrated on Earth would show it. */
export const scaleReading = (mass: number, g: number) => (mass * g) / G_EARTH

export const ORBITS = [
  { name: 'ISS', km: 400 },
  { name: 'GPS satellites', km: 20200 },
  { name: 'Geostationary', km: 35786 },
]
