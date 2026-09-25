/** Distance (km) from Majestic towards Whitefield (20 km) at time t (minutes). Piecewise linear. */
type Piece = [t0: number, t1: number, d0: number, d1: number]

function build(pieces: Piece[]) {
  return (t: number) => {
    for (const [t0, t1, d0, d1] of pieces) if (t >= t0 && t <= t1) return d0 + ((d1 - d0) * (t - t0)) / (t1 - t0)
    return pieces[pieces.length - 1][3]
  }
}

export const TRAVELLERS = [
  { id: 'metro', name: 'Metro', emoji: '🚇', color: '#7c3aed', at: build([[0, 8, 0, 4], [8, 9, 4, 4], [9, 17, 4, 8], [17, 18, 8, 8], [18, 26, 8, 12], [26, 27, 12, 12], [27, 35, 12, 16], [35, 36, 16, 16], [36, 44, 16, 20]]) },
  { id: 'car', name: 'Car', emoji: '🚗', color: '#dc2626', at: build([[0, 10, 0, 6], [10, 30, 6, 6], [30, 50, 6, 20]]) },
  { id: 'auto', name: 'Auto', emoji: '🛺', color: '#ca8a04', at: build([[0, 20, 0, 10], [20, 25, 10, 10], [25, 45, 10, 20]]) },
  { id: 'cycle', name: 'Cyclist', emoji: '🚴', color: '#16a34a', at: build([[0, 20 / 0.36, 0, 20]]) },
] as const

export const chartData = Array.from({ length: 61 }, (_, t) => {
  const row: Record<string, number> = { t }
  for (const tr of TRAVELLERS) row[tr.id] = Math.round(tr.at(t) * 100) / 100
  return row
})

export type Q =
  | { q: string; kind: 'pick'; answer: string; explain: string }
  | { q: string; kind: 'number'; answer: number; tolerance: number; unit: string; explain: string }
  | { q: string; kind: 'choice'; options: string[]; answer: number; explain: string }

export const QUESTIONS: Q[] = [
  { q: 'Who reached Whitefield FIRST?', kind: 'pick', answer: 'metro', explain: 'The metro’s line reaches 20 km first, at 44 minutes.' },
  { q: 'Who travelled at a CONSTANT speed the whole way?', kind: 'pick', answer: 'cycle', explain: 'The cyclist’s graph is one straight line: the same slope throughout.' },
  { q: 'How many minutes was the car stuck in the traffic jam?', kind: 'number', answer: 20, tolerance: 0, unit: 'minutes', explain: 'The car’s line is flat from 10 to 30 minutes: 20 minutes of not moving.' },
  { q: 'How far had the auto travelled when it stopped for chai?', kind: 'number', answer: 10, tolerance: 0, unit: 'km', explain: 'The auto’s line goes flat at 10 km (from 20 to 25 minutes).' },
  { q: 'At 30 minutes, who was furthest ahead?', kind: 'pick', answer: 'metro', explain: 'At t = 30 min: metro 13.5 km, auto 12.5 km, cyclist 10.8 km, car 6 km.' },
  { q: 'When was the car moving FASTEST?', kind: 'choice', options: ['0 to 10 minutes', '10 to 30 minutes', '30 to 50 minutes'], answer: 2, explain: 'The steepest part of the car’s line is from 30 to 50 min: 14 km in 20 min (0.7 km/min).' },
  { q: 'What was the metro’s AVERAGE speed in km/h? (20 km in 44 minutes, including station stops)', kind: 'number', answer: 27.3, tolerance: 0.6, unit: 'km/h', explain: '44 min = 44/60 h ≈ 0.733 h. Speed = 20 ÷ 0.733 ≈ 27.3 km/h.' },
  { q: 'Who arrived LAST?', kind: 'pick', answer: 'cycle', explain: 'The cyclist reaches 20 km at about 55.6 minutes. Slow but steady, and zero pollution!' },
]
