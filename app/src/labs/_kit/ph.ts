/** Shared acid–base data for the Unit 4 labs. pH values are typical textbook values. */

export type Solution = { id: string; name: string; emoji: string; pH: number; note?: string }

export const SOLUTIONS: Solution[] = [
  { id: 'hcl', name: 'Dilute hydrochloric acid', emoji: '🧪', pH: 1, note: 'A strong acid (also in your stomach!)' },
  { id: 'lemon', name: 'Lemon juice', emoji: '🍋', pH: 2.2, note: 'Contains citric acid' },
  { id: 'vinegar', name: 'Vinegar', emoji: '🫙', pH: 2.9, note: 'Contains acetic acid' },
  { id: 'soda', name: 'Soda water / cola', emoji: '🥤', pH: 3.5, note: 'Contains carbonic acid' },
  { id: 'tamarind', name: 'Tamarind (imli) water', emoji: '🟤', pH: 3.2, note: 'Contains tartaric acid' },
  { id: 'tomato', name: 'Tomato juice', emoji: '🍅', pH: 4.3 },
  { id: 'curd', name: 'Curd (dahi) water', emoji: '🥣', pH: 4.5, note: 'Contains lactic acid' },
  { id: 'milk', name: 'Milk', emoji: '🥛', pH: 6.6 },
  { id: 'water', name: 'Pure water', emoji: '💧', pH: 7 },
  { id: 'salt', name: 'Salt water', emoji: '🧂', pH: 7 },
  { id: 'sugar', name: 'Sugar water', emoji: '🍬', pH: 7 },
  { id: 'blood', name: 'Blood', emoji: '🩸', pH: 7.4 },
  { id: 'bakingsoda', name: 'Baking soda solution', emoji: '🧁', pH: 8.4 },
  { id: 'toothpaste', name: 'Toothpaste in water', emoji: '🪥', pH: 9 },
  { id: 'antacid', name: 'Antacid (milk of magnesia)', emoji: '💊', pH: 10.5 },
  { id: 'soap', name: 'Soap solution', emoji: '🧼', pH: 10 },
  { id: 'limewater', name: 'Lime water', emoji: '🥛', pH: 12.4 },
  { id: 'bleach', name: 'Bleach', emoji: '🧴', pH: 12.8, note: 'Never mix with acids!' },
  { id: 'naoh', name: 'Sodium hydroxide solution', emoji: '⚗️', pH: 14, note: 'A strong base (alkali)' },
]

export const getSolution = (id: string) => SOLUTIONS.find((s) => s.id === id)!

export type Nature = 'acidic' | 'neutral' | 'basic'
export const natureOf = (pH: number): Nature => (pH < 6.5 ? 'acidic' : pH > 7.5 ? 'basic' : 'neutral')

/** Universal indicator colour for pH 0–14. */
const UNIVERSAL = ['#b91c1c', '#dc2626', '#ef4444', '#f97316', '#fb923c', '#facc15', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9', '#2563eb', '#4f46e5', '#6d28d9', '#581c87']
export function universalColour(pH: number) {
  return UNIVERSAL[Math.max(0, Math.min(14, Math.round(pH)))]
}

export type IndicatorId = 'blue-litmus' | 'red-litmus' | 'turmeric' | 'china-rose' | 'red-cabbage' | 'phenolphthalein' | 'methyl-orange' | 'universal'

export type Indicator = { id: IndicatorId; name: string; natural: boolean; start: string; colour: (pH: number) => { hex: string; label: string } }

export const INDICATORS: Indicator[] = [
  {
    id: 'blue-litmus',
    name: 'Blue litmus paper',
    natural: true,
    start: '#3b82f6',
    colour: (pH) => (pH < 6.5 ? { hex: '#ef4444', label: 'turns red' } : { hex: '#3b82f6', label: 'stays blue' }),
  },
  {
    id: 'red-litmus',
    name: 'Red litmus paper',
    natural: true,
    start: '#ef4444',
    colour: (pH) => (pH > 7.5 ? { hex: '#3b82f6', label: 'turns blue' } : { hex: '#ef4444', label: 'stays red' }),
  },
  {
    id: 'turmeric',
    name: 'Turmeric (haldi) paper',
    natural: true,
    start: '#facc15',
    colour: (pH) => (pH > 8 ? { hex: '#b91c1c', label: 'turns red-brown' } : { hex: '#facc15', label: 'stays yellow' }),
  },
  {
    id: 'china-rose',
    name: 'China rose (hibiscus) extract',
    natural: true,
    start: '#c084fc',
    colour: (pH) => (pH < 6.5 ? { hex: '#db2777', label: 'turns dark pink (magenta)' } : pH > 7.5 ? { hex: '#16a34a', label: 'turns green' } : { hex: '#c084fc', label: 'no change' }),
  },
  {
    id: 'red-cabbage',
    name: 'Red cabbage juice',
    natural: true,
    start: '#7c3aed',
    colour: (pH) => {
      if (pH < 3) return { hex: '#dc2626', label: 'red' }
      if (pH < 5) return { hex: '#db2777', label: 'pink' }
      if (pH < 7.5) return { hex: '#7c3aed', label: 'purple' }
      if (pH < 9) return { hex: '#2563eb', label: 'blue' }
      if (pH < 12) return { hex: '#16a34a', label: 'green' }
      return { hex: '#ca8a04', label: 'yellow' }
    },
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    natural: false,
    start: '#f8fafc',
    colour: (pH) => (pH >= 8.2 ? { hex: '#ec4899', label: 'turns pink' } : { hex: '#f8fafc', label: 'stays colourless' }),
  },
  {
    id: 'methyl-orange',
    name: 'Methyl orange',
    natural: false,
    start: '#f97316',
    colour: (pH) => (pH < 3.1 ? { hex: '#dc2626', label: 'turns red' } : pH < 4.4 ? { hex: '#f97316', label: 'orange' } : { hex: '#facc15', label: 'turns yellow' }),
  },
  {
    id: 'universal',
    name: 'Universal indicator',
    natural: false,
    start: '#22c55e',
    colour: (pH) => ({ hex: universalColour(pH), label: `pH ≈ ${Math.round(pH)}` }),
  },
]

export const getIndicator = (id: IndicatorId) => INDICATORS.find((i) => i.id === id)!

/** Strong acid (0.1 M HCl, 50 mL) titrated with strong base (0.1 M NaOH). */
export function titrationPH(mlBaseAdded: number, acidMl = 50, acidM = 0.1, baseM = 0.1) {
  const acidMol = (acidM * acidMl) / 1000
  const baseMol = (baseM * mlBaseAdded) / 1000
  const totalL = (acidMl + mlBaseAdded) / 1000
  const diff = acidMol - baseMol
  if (Math.abs(diff) < 1e-9) return 7
  if (diff > 0) return -Math.log10(diff / totalL)
  return 14 + Math.log10(-diff / totalL)
}
