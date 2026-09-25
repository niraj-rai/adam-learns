/** A single series loop of components, like the circuits in Class 6–8. */
export type Part =
  | { type: 'wire' }
  | { type: 'cell'; reversed?: boolean; dead?: boolean }
  | { type: 'bulb'; fused?: boolean }
  | { type: 'led'; reversed?: boolean }
  | { type: 'switch'; closed: boolean }
  | { type: 'material'; id: string }

export const MATERIALS = [
  { id: 'copper', name: 'Copper wire', emoji: '🟠', conductor: true, r: 0 },
  { id: 'foil', name: 'Aluminium foil', emoji: '🥫', conductor: true, r: 0 },
  { id: 'nail', name: 'Iron nail', emoji: '📌', conductor: true, r: 0.2 },
  { id: 'spoon', name: 'Steel spoon', emoji: '🥄', conductor: true, r: 0.2 },
  { id: 'graphite', name: 'Pencil lead (graphite)', emoji: '✏️', conductor: true, r: 4 },
  { id: 'water', name: 'Salt water', emoji: '🧂', conductor: true, r: 8 },
  { id: 'plastic', name: 'Plastic ruler', emoji: '📏', conductor: false, r: Infinity },
  { id: 'rubber', name: 'Rubber band', emoji: '➰', conductor: false, r: Infinity },
  { id: 'wood', name: 'Wooden stick', emoji: '🪵', conductor: false, r: Infinity },
  { id: 'paper', name: 'Paper', emoji: '📄', conductor: false, r: Infinity },
  { id: 'glass', name: 'Glass rod', emoji: '🧪', conductor: false, r: Infinity },
]

export const CELL_V = 1.5
const BULB_R = 5
const LED_R = 20
const LED_DROP = 2 // an LED needs about 2 V before it lights
const INTERNAL_R = 0.5

export type Result = {
  current: number
  /** Brightness of each bulb relative to one bulb on one cell (1 = normal). */
  bulb: number
  ledOn: boolean
  reason: 'works' | 'open-switch' | 'insulator' | 'fused-bulb' | 'no-cell' | 'cells-cancel' | 'led-reversed' | 'led-needs-more-voltage'
}

const ONE_BULB_POWER = ((CELL_V / (BULB_R + INTERNAL_R)) ** 2) * BULB_R

export function evaluate(parts: Part[]): Result {
  const off = (reason: Result['reason']): Result => ({ current: 0, bulb: 0, ledOn: false, reason })
  if (parts.some((p) => p.type === 'switch' && !p.closed)) return off('open-switch')
  if (parts.some((p) => p.type === 'material' && !MATERIALS.find((m) => m.id === p.id)!.conductor)) return off('insulator')
  if (parts.some((p) => p.type === 'bulb' && p.fused)) return off('fused-bulb')
  const cells = parts.filter((p): p is Extract<Part, { type: 'cell' }> => p.type === 'cell' && !p.dead)
  if (!cells.length) return off('no-cell')
  const v = cells.reduce((s, c) => s + (c.reversed ? -CELL_V : CELL_V), 0)
  if (v === 0) return off('cells-cancel')
  const leds = parts.filter((p): p is Extract<Part, { type: 'led' }> => p.type === 'led')
  // an LED only conducts one way: it must point the same way as the push from the battery
  if (leds.some((l) => (l.reversed ? -1 : 1) * Math.sign(v) < 0)) return off('led-reversed')
  const drive = Math.abs(v) - LED_DROP * leds.length
  if (drive <= 0) return off('led-needs-more-voltage')
  const bulbs = parts.filter((p) => p.type === 'bulb').length
  const r = bulbs * BULB_R + leds.length * LED_R + INTERNAL_R + parts.reduce((s, p) => s + (p.type === 'material' ? MATERIALS.find((m) => m.id === p.id)!.r : 0), 0)
  const current = drive / r
  return { current, bulb: bulbs ? (current ** 2 * BULB_R) / ONE_BULB_POWER : 0, ledOn: leds.length > 0, reason: 'works' }
}

export const REASON_TEXT: Record<Result['reason'], string> = {
  works: 'The circuit is complete: current flows all the way round.',
  'open-switch': 'The switch is open, so there is a gap in the circuit and no current can flow.',
  insulator: 'An insulator is in the circuit. It doesn’t let current through, so the circuit is broken.',
  'fused-bulb': 'The bulb’s filament is broken (fused), so there is a gap inside the bulb.',
  'no-cell': 'There is no working cell to push the current round.',
  'cells-cancel': 'The cells face opposite ways, so their pushes cancel out.',
  'led-reversed': 'The LED is the wrong way round. LEDs only let current through in one direction (long leg to +).',
  'led-needs-more-voltage': 'An LED needs about 2 V to light. One 1.5 V cell is not enough: add another cell.',
}

/** Two identical bulbs on the same battery, in series or in parallel. Brightness relative to one bulb alone. */
export function twoBulbs(arrangement: 'series' | 'parallel', cells: number, removeOne = false) {
  const v = cells * CELL_V
  if (arrangement === 'series') {
    if (removeOne) return [0, 0]
    const i = v / (2 * BULB_R)
    const b = (i ** 2 * BULB_R) / ((v / BULB_R) ** 2 * BULB_R)
    return [b, b]
  }
  return removeOne ? [0, 1] : [1, 1]
}
