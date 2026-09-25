/** A teaching model: each design choice adds or removes degrees from the indoor temperature. */
export type Option = { id: string; name: string; emoji: string; cost: number; summer: number; winter: number; why: string }
export type Part = { id: 'roof' | 'walls' | 'windows' | 'outside' | 'paint'; name: string; options: Option[] }

export const PARTS: Part[] = [
  { id: 'roof', name: 'Roof', options: [
    { id: 'tin', name: 'Tin sheet', emoji: '🔩', cost: 1, summer: 6, winter: -3, why: 'Thin metal conducts heat straight through: an oven by day, and it loses heat fast at night.' },
    { id: 'concrete', name: 'Plain concrete slab', emoji: '⬜', cost: 2, summer: 3, winter: 1, why: 'Grey concrete absorbs sunlight all day and radiates it indoors in the evening.' },
    { id: 'cool-roof', name: 'Concrete, painted white', emoji: '🤍', cost: 3, summer: -1, winter: 0, why: 'A white “cool roof” reflects most sunlight, so much less heat is absorbed.' },
    { id: 'tiles', name: 'Mangalore clay tiles', emoji: '🧱', cost: 3, summer: 0, winter: 0, why: 'Clay tiles on a sloping roof keep an air gap underneath, and air is a good insulator.' },
    { id: 'green', name: 'Green roof (plants)', emoji: '🌿', cost: 5, summer: -2, winter: 2, why: 'Soil insulates, and plants shade the roof and cool it by evaporation.' },
  ] },
  { id: 'walls', name: 'Walls', options: [
    { id: 'thin', name: 'Single thin brick', emoji: '🧱', cost: 1, summer: 2, winter: -2, why: 'Thin walls let heat conduct through quickly.' },
    { id: 'rat-trap', name: 'Rat-trap bond brick', emoji: '🏠', cost: 2, summer: -3, winter: 3, why: 'Bricks laid on edge leave air gaps inside the wall. Trapped air insulates, and it uses fewer bricks! Architect Laurie Baker made this popular in Kerala.' },
    { id: 'glass', name: 'Glass walls', emoji: '🪟', cost: 5, summer: 6, winter: -3, why: 'Sunlight gets in and the heat is trapped like a greenhouse by day. Thin glass loses heat quickly at night.' },
  ] },
  { id: 'windows', name: 'Windows', options: [
    { id: 'small', name: 'Small windows on one side', emoji: '🔲', cost: 1, summer: 1, winter: 1, why: 'Little air movement, so hot air stays inside.' },
    { id: 'cross', name: 'Cross ventilation', emoji: '🌬️', cost: 2, summer: -3, winter: -1, why: 'Windows on opposite walls let a breeze flow through and carry hot air away by convection.' },
    { id: 'south', name: 'Big south windows with sunshades', emoji: '⛱️', cost: 3, summer: -1, winter: 3, why: 'The high summer sun is blocked by the shades (chajjas); the low winter sun shines in and warms the room.' },
  ] },
  { id: 'outside', name: 'Around the house', options: [
    { id: 'none', name: 'Bare ground', emoji: '🟫', cost: 0, summer: 0, winter: 0, why: 'No shade, no help.' },
    { id: 'trees', name: 'Neem shade trees', emoji: '🌳', cost: 1, summer: -3, winter: -1, why: 'Trees shade the walls and cool the air by evaporation from their leaves.' },
    { id: 'paving', name: 'Dark paving', emoji: '⬛', cost: 1, summer: 2, winter: 0, why: 'Dark paving absorbs sunlight and radiates heat onto the house.' },
  ] },
  { id: 'paint', name: 'Outside walls', options: [
    { id: 'dark', name: 'Dark paint', emoji: '🟤', cost: 0, summer: 2, winter: 1, why: 'Dark colours absorb more radiation.' },
    { id: 'light', name: 'White or light paint', emoji: '⚪', cost: 1, summer: -2, winter: 0, why: 'Light colours reflect radiation.' },
  ] },
]

export type Design = Record<Part['id'], string>
export type Brief = { id: string; title: string; emoji: string; season: 'summer' | 'winter'; outdoor: number; base: number; goal: number; budget: number | null; story: string }

export const BRIEFS: Brief[] = [
  { id: 'chennai', title: 'Chennai in May', emoji: '🥵', season: 'summer', outdoor: 40, base: 0, goal: 31, budget: null, story: 'A family in Chennai wants a home that stays at 31 °C or cooler on a 40 °C afternoon, without an air conditioner.' },
  { id: 'budget', title: 'Cool on a budget', emoji: '🪙', season: 'summer', outdoor: 40, base: 0, goal: 31, budget: 9, story: 'Same goal, but the family can only spend 9 coins. Choose wisely!' },
  { id: 'delhi', title: 'Delhi in January', emoji: '🥶', season: 'winter', outdoor: 6, base: 6, goal: 18, budget: null, story: 'On a 6 °C winter night in Delhi, keep the home at a comfortable 18 °C or warmer without a heater. People and cooking add about 6 °C.' },
]

export const DEFAULT_DESIGN: Design = { roof: 'tin', walls: 'thin', windows: 'small', outside: 'none', paint: 'dark' }

const opt = (part: Part['id'], id: string) => PARTS.find((p) => p.id === part)!.options.find((o) => o.id === id)!

export const costOf = (d: Design) => PARTS.reduce((s, p) => s + opt(p.id, d[p.id]).cost, 0)

export const indoorTemp = (d: Design, b: Brief) => b.outdoor + b.base + PARTS.reduce((s, p) => s + opt(p.id, d[p.id])[b.season], 0)

export function meetsBrief(d: Design, b: Brief) {
  const t = indoorTemp(d, b)
  const okTemp = b.season === 'summer' ? t <= b.goal : t >= b.goal
  return okTemp && (b.budget === null || costOf(d) <= b.budget)
}

/** Every possible design (for tests and hints). */
export function allDesigns(): Design[] {
  let out: Partial<Design>[] = [{}]
  for (const p of PARTS) out = out.flatMap((d) => p.options.map((o) => ({ ...d, [p.id]: o.id })))
  return out as Design[]
}
