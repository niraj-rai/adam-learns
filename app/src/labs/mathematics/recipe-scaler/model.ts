export const RECIPE = {
  name: 'Masala chai',
  serves: 4,
  items: [
    { name: 'Water', emoji: '💧', qty: 400, unit: 'mL' },
    { name: 'Milk', emoji: '🥛', qty: 400, unit: 'mL' },
    { name: 'Tea leaves', emoji: '🍃', qty: 4, unit: 'tsp' },
    { name: 'Sugar', emoji: '🍬', qty: 8, unit: 'tsp' },
    { name: 'Ginger', emoji: '🫚', qty: 2, unit: 'cm' },
    { name: 'Cardamom pods', emoji: '🟢', qty: 4, unit: '' },
  ],
}
/** Unitary method: find one, then multiply. */
export const scale = (qty: number, from: number, to: number) => Math.round(((qty / from) * to) * 100) / 100
export const CONVERSIONS = [
  { from: 'km', to: 'm', k: 1000 },
  { from: 'm', to: 'cm', k: 100 },
  { from: 'kg', to: 'g', k: 1000 },
  { from: 'L', to: 'mL', k: 1000 },
  { from: 'hours', to: 'minutes', k: 60 },
  { from: 'km/h', to: 'm/s', k: 5 / 18 },
]
