export type Container = { id: string; name: string; emoji: string; colour: string; k: number; lidHelps: boolean; evaporative?: boolean }

/** Cooling constants per minute (Newton's law of cooling, teaching values). Smaller k = better insulation. */
export const HOT_CONTAINERS: Container[] = [
  { id: 'steel', name: 'Steel tumbler', emoji: '🥛', colour: '#64748b', k: 0.05, lidHelps: true },
  { id: 'glass', name: 'Glass', emoji: '🥃', colour: '#06b6d4', k: 0.04, lidHelps: true },
  { id: 'kulhad', name: 'Clay kulhad', emoji: '🏺', colour: '#b45309', k: 0.035, lidHelps: true },
  { id: 'thermocol', name: 'Thermocol cup', emoji: '🥤', colour: '#a855f7', k: 0.018, lidHelps: true },
  { id: 'flask', name: 'Vacuum flask', emoji: '🧴', colour: '#16a34a', k: 0.002, lidHelps: false },
]

export const COLD_CONTAINERS: Container[] = [
  { id: 'plastic', name: 'Plastic bottle', emoji: '🧃', colour: '#0ea5e9', k: 0.02, lidHelps: false },
  { id: 'steel-bottle', name: 'Steel bottle', emoji: '🍶', colour: '#64748b', k: 0.025, lidHelps: false },
  { id: 'matka', name: 'Clay matka (pot)', emoji: '🏺', colour: '#b45309', k: 0.012, lidHelps: false, evaporative: true },
  { id: 'insulated', name: 'Insulated bottle', emoji: '🧴', colour: '#16a34a', k: 0.002, lidHelps: false },
]

/** Temperature after t minutes, heading exponentially towards `target`. */
export const tempAt = (start: number, target: number, k: number, t: number) => target + (start - target) * Math.exp(-k * t)

/** A lid cuts heat loss by evaporation and convection, roughly halving the cooling rate. */
export const effectiveK = (c: Container, lid: boolean) => (lid && c.lidHelps ? c.k * 0.55 : c.k)

/** A porous clay matka is cooled by evaporation from its surface, so it heads for a temperature below the room's. */
export const targetFor = (c: Container, room: number) => (c.evaporative ? room - 10 : room)

/** Minutes until the temperature falls below `limit` (Infinity if it never does). */
export function minutesAbove(start: number, target: number, k: number, limit: number) {
  if (target >= limit) return Infinity
  if (start <= limit) return 0
  return Math.log((start - target) / (limit - target)) / k
}
