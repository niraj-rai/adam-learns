/** Work, energy, power and simple machines: pure helpers for the Grade 9 energy labs. */
import { G_EARTH } from './dynamics'

export type ForceDirection = 'along' | 'against' | 'perpendicular'

/** Work done by a constant force over a displacement: positive along the motion, negative against it, zero at right angles. */
export function work(force: number, displacement: number, dir: ForceDirection = 'along') {
  if (dir === 'perpendicular') return 0
  return (dir === 'along' ? 1 : -1) * force * displacement + 0
}

export const kineticEnergy = (m: number, v: number) => 0.5 * m * v * v
export const potentialEnergy = (m: number, h: number, g = G_EARTH) => m * g * h
/** Speed after falling h metres from rest with no air resistance: PE lost = KE gained. */
export const speedFromDrop = (h: number, g = G_EARTH) => Math.sqrt(2 * g * h)

export const power = (energy: number, t: number) => energy / t
/** Electrical energy in kilowatt-hours ('units' on an Indian electricity bill). */
export const kWh = (watts: number, hours: number) => (watts * hours) / 1000

export const mechanicalAdvantage = (load: number, effort: number) => load / effort
export const velocityRatio = (effortDistance: number, loadDistance: number) => effortDistance / loadDistance
export const efficiency = (usefulOut: number, totalIn: number) => usefulOut / totalIn

/** Effort needed to balance a lever: load × load arm = effort × effort arm. */
export const leverEffort = (load: number, loadArm: number, effortArm: number) => (load * loadArm) / effortArm

/** Ideal effort for common machines, then scaled up for efficiency (0-1]. */
export const pulleyEffort = (load: number, strands: number, eff = 1) => load / strands / eff
export const rampEffort = (load: number, height: number, length: number, eff = 1) => (load * height) / length / eff
