export type Form = 'light' | 'chemical' | 'electrical' | 'kinetic' | 'thermal' | 'sound' | 'gravitational'

export const FORM_LABEL: Record<Form, { name: string; emoji: string }> = {
  light: { name: 'Light', emoji: '💡' },
  chemical: { name: 'Chemical', emoji: '🧪' },
  electrical: { name: 'Electrical', emoji: '⚡' },
  kinetic: { name: 'Kinetic (motion)', emoji: '🏃' },
  thermal: { name: 'Thermal (heat)', emoji: '🔥' },
  sound: { name: 'Sound', emoji: '🔊' },
  gravitational: { name: 'Gravitational potential', emoji: '⛰️' },
}

/** A converter takes one form of energy in and gives out a useful form (plus some wasted heat). */
export type Device = { id: string; name: string; emoji: string; input: Form; output: Form; efficiency: number }

export const DEVICES: Device[] = [
  { id: 'solar', name: 'Solar panel', emoji: '🔲', input: 'light', output: 'electrical', efficiency: 0.2 },
  { id: 'plant', name: 'Plant (photosynthesis)', emoji: '🌱', input: 'light', output: 'chemical', efficiency: 0.02 },
  { id: 'fall', name: 'Water falling down a pipe', emoji: '🌊', input: 'gravitational', output: 'kinetic', efficiency: 0.9 },
  { id: 'generator', name: 'Turbine and generator', emoji: '⚙️', input: 'kinetic', output: 'electrical', efficiency: 0.9 },
  { id: 'dynamo', name: 'Cycle dynamo', emoji: '🚲', input: 'kinetic', output: 'electrical', efficiency: 0.6 },
  { id: 'boiler', name: 'Burning in a boiler', emoji: '🔥', input: 'chemical', output: 'thermal', efficiency: 0.85 },
  { id: 'steam', name: 'Steam turbine', emoji: '💨', input: 'thermal', output: 'kinetic', efficiency: 0.4 },
  { id: 'muscles', name: 'Your muscles', emoji: '💪', input: 'chemical', output: 'kinetic', efficiency: 0.25 },
  { id: 'battery', name: 'Battery (discharging)', emoji: '🔋', input: 'chemical', output: 'electrical', efficiency: 0.9 },
  { id: 'fan', name: 'Electric fan (motor)', emoji: '🌀', input: 'electrical', output: 'kinetic', efficiency: 0.7 },
  { id: 'led', name: 'LED bulb', emoji: '💡', input: 'electrical', output: 'light', efficiency: 0.4 },
  { id: 'speaker', name: 'Speaker', emoji: '🔊', input: 'electrical', output: 'sound', efficiency: 0.05 },
  { id: 'heater', name: 'Electric heater', emoji: '♨️', input: 'electrical', output: 'thermal', efficiency: 1 },
]

export type Challenge = { id: string; title: string; start: { name: string; emoji: string; form: Form }; goal: Form; goalText: string }

export const CHALLENGES: Challenge[] = [
  { id: 'sun-fan', title: 'Sunshine to breeze', start: { name: 'The Sun', emoji: '☀️', form: 'light' }, goal: 'kinetic', goalText: 'Spin a ceiling fan' },
  { id: 'dam-led', title: 'Dam to street light', start: { name: 'Water behind a dam', emoji: '🏞️', form: 'gravitational' }, goal: 'light', goalText: 'Light an LED street lamp' },
  { id: 'coal-heater', title: 'Coal to room heater', start: { name: 'Coal', emoji: '🪨', form: 'chemical' }, goal: 'thermal', goalText: 'Warm a room with an electric heater' },
  { id: 'idli-lamp', title: 'Breakfast to bicycle lamp', start: { name: 'Idli breakfast', emoji: '🍚', form: 'chemical' }, goal: 'light', goalText: 'Light the lamp on your cycle, pedalling a dynamo' },
  { id: 'sun-cycle', title: 'Sun to pedal power', start: { name: 'The Sun', emoji: '☀️', form: 'light' }, goal: 'kinetic', goalText: 'Pedal your cycle, using energy from food' },
]

export type ChainCheck = { ok: boolean; output: Form; useful: number; brokenAt: number | null }

/** Follow a chain of devices from a starting form. `useful` is the fraction of the input energy that ends up in the useful form. */
export function checkChain(start: Form, deviceIds: string[]): ChainCheck {
  let form = start
  let useful = 1
  for (let i = 0; i < deviceIds.length; i++) {
    const d = DEVICES.find((x) => x.id === deviceIds[i])
    if (!d || d.input !== form) return { ok: false, output: form, useful, brokenAt: i }
    form = d.output
    useful *= d.efficiency
  }
  return { ok: true, output: form, useful, brokenAt: null }
}

export const solves = (c: Challenge, deviceIds: string[], extra?: (ids: string[]) => boolean) => {
  const r = checkChain(c.start.form, deviceIds)
  return r.ok && deviceIds.length > 0 && r.output === c.goal && (extra ? extra(deviceIds) : true)
}

/** Some challenges need a particular final device. */
export const REQUIRED_LAST: Record<string, string> = { 'sun-fan': 'fan', 'dam-led': 'led', 'coal-heater': 'heater', 'idli-lamp': 'led', 'sun-cycle': 'muscles' }
export const REQUIRED_ANY: Record<string, string> = { 'idli-lamp': 'dynamo', 'sun-cycle': 'plant' }

export const isSolved = (c: Challenge, ids: string[]) =>
  solves(c, ids) && ids[ids.length - 1] === REQUIRED_LAST[c.id] && (!REQUIRED_ANY[c.id] || ids.includes(REQUIRED_ANY[c.id]))
