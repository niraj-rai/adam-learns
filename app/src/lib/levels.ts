export const LEVELS = [
  { name: 'Lab Rookie', xp: 0, emoji: '🧪' },
  { name: 'Lab Assistant', xp: 150, emoji: '🥽' },
  { name: 'Scientist', xp: 400, emoji: '🔬' },
  { name: 'Chief Scientist', xp: 900, emoji: '⚗️' },
  { name: 'Nobel Candidate', xp: 1800, emoji: '🏅' },
] as const

export function levelFor(xp: number) {
  let index = 0
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) index = i
  const current = LEVELS[index]
  const next = LEVELS[index + 1]
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1
  return { index, current, next, progress }
}

export const XP = {
  lessonComplete: 20,
  correctAnswer: 5,
  correctFirstTry: 3,
  mastery: 30,
  labExplored: 10,
  prediction: 2,
  reviewCorrect: 4,
} as const

export const MASTERY_THRESHOLD = 0.8
