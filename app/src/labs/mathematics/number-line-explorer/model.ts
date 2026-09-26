export type Op = '+' | '-'
export type Step = { op: Op; n: number }

/** The signed hop on the number line: subtracting a negative is a hop to the right. */
export const hop = (s: Step) => (s.op === '+' ? s.n : -s.n)

/** Every position visited, starting from `start`. */
export function positions(start: number, steps: Step[]) {
  const out = [start]
  for (const s of steps) out.push(out[out.length - 1] + hop(s))
  return out
}

export const fmt = (n: number) => (n < 0 ? `(−${-n})` : `${n}`)
export const expression = (start: number, steps: Step[]) =>
  [start < 0 ? `−${-start}` : `${start}`, ...steps.map((s) => `${s.op === '+' ? '+' : '−'} ${fmt(s.n)}`)].join(' ')

export type Story = { emoji: string; text: string; start: number; steps: Step[]; unit: string }
export const STORIES: Story[] = [
  { emoji: '🏔️', text: 'At dawn in Leh it is −8 °C. By noon it warms up by 13 °C. What is the noon temperature?', start: -8, steps: [{ op: '+', n: 13 }], unit: '°C' },
  { emoji: '🛗', text: 'A lift starts at floor 4, goes down 7 floors to the basement parking, then up 2. Which floor is it on?', start: 4, steps: [{ op: '-', n: 7 }, { op: '+', n: 2 }], unit: 'floor' },
  { emoji: '🤿', text: 'A diver is 12 m below sea level (−12 m) and swims up 5 m. How deep is she now?', start: -12, steps: [{ op: '+', n: 5 }], unit: 'm' },
  { emoji: '🏏', text: 'A team’s net score is −3. The umpire cancels a −4 penalty (subtract −4). What is the new net score?', start: -3, steps: [{ op: '-', n: -4 }], unit: 'runs' },
  { emoji: '💰', text: 'Riya has ₹50. She spends ₹80 at the stationery shop (on credit), then gets ₹45 pocket money. What is her balance?', start: 50, steps: [{ op: '-', n: 80 }, { op: '+', n: 45 }], unit: '₹' },
  { emoji: '❄️', text: 'A freezer is at −18 °C. The power fails and it warms by 11 °C, then cools again by 6 °C. What is the temperature?', start: -18, steps: [{ op: '+', n: 11 }, { op: '-', n: 6 }], unit: '°C' },
]
