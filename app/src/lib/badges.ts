export type BadgeId =
  | 'first-lesson'
  | 'first-mastery'
  | 'predictor'
  | 'lab-explorer'
  | 'particle-pro'
  | 'streak-3'
  | 'streak-7'
  | 'unit-matter'
  | 'unit-mixtures'
  | 'well-rescuer'
  | 'perfect-score'

export const BADGES: Record<BadgeId, { title: string; emoji: string; description: string }> = {
  'first-lesson': { title: 'First Steps', emoji: '👣', description: 'Finished your first lesson' },
  'first-mastery': { title: 'Got It!', emoji: '🎯', description: 'Mastered your first topic (80%+ on the check)' },
  predictor: { title: 'Bold Predictor', emoji: '🔮', description: 'Made 10 predictions before seeing the answer' },
  'lab-explorer': { title: 'Lab Explorer', emoji: '🧫', description: 'Tried 3 different labs' },
  'particle-pro': { title: 'Particle Pro', emoji: '⚛️', description: 'Melted, boiled and froze a substance in the Particle Simulator' },
  'streak-3': { title: 'On a Roll', emoji: '🔥', description: 'Learned 3 days in a row' },
  'streak-7': { title: 'Week Warrior', emoji: '🌟', description: 'Learned 7 days in a row' },
  'unit-matter': { title: 'Matter Master', emoji: '🧊', description: 'Mastered every core topic in Unit 1: Matter' },
  'unit-mixtures': { title: 'Separation Specialist', emoji: '🧪', description: 'Mastered every core topic in Unit 2: Mixtures & Separation' },
  'well-rescuer': { title: 'Well Rescuer', emoji: '🚰', description: 'Made the village well water safe to drink (Boss Challenge)' },
  'perfect-score': { title: 'Flawless', emoji: '💎', description: 'Scored 100% on a practice set' },
}
