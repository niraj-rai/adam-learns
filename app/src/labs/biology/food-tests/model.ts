export type Food = { id: string; name: string; emoji: string; starch: boolean; protein: boolean; fat: boolean }

/** Simplified school food-test results (a “yes” means a clear positive result). */
export const FOODS: Food[] = [
  { id: 'rice', name: 'Cooked rice', emoji: '🍚', starch: true, protein: false, fat: false },
  { id: 'potato', name: 'Raw potato', emoji: '🥔', starch: true, protein: false, fat: false },
  { id: 'dal', name: 'Moong dal (soaked)', emoji: '🫘', starch: true, protein: true, fat: false },
  { id: 'egg', name: 'Boiled egg white', emoji: '🥚', starch: false, protein: true, fat: false },
  { id: 'milk', name: 'Milk', emoji: '🥛', starch: false, protein: true, fat: true },
  { id: 'peanut', name: 'Groundnuts', emoji: '🥜', starch: false, protein: true, fat: true },
  { id: 'ghee', name: 'Ghee', emoji: '🧈', starch: false, protein: false, fat: true },
  { id: 'coconut', name: 'Coconut', emoji: '🥥', starch: false, protein: false, fat: true },
  { id: 'banana', name: 'Ripe banana', emoji: '🍌', starch: false, protein: false, fat: false },
  { id: 'paneer', name: 'Paneer', emoji: '🧀', starch: false, protein: true, fat: true },
]

export const TESTS = {
  starch: { name: 'Iodine test (starch)', reagent: 'dilute iodine solution', positive: 'blue-black', negative: 'stays brown', colour: '#1e1b4b', none: '#b45309' },
  protein: { name: 'Protein test', reagent: 'copper sulphate + sodium hydroxide', positive: 'violet', negative: 'stays blue', colour: '#7c3aed', none: '#60a5fa' },
  fat: { name: 'Paper test (fat)', reagent: 'rub on paper', positive: 'oily translucent patch', negative: 'no patch', colour: '#fde68a', none: '#f5f5f4' },
} as const

export type TestId = keyof typeof TESTS
export const result = (f: Food, t: TestId) => f[t]
