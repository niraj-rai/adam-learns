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
  | 'unit-changes'
  | 'fire-officer'
  | 'unit-acids'
  | 'mystery-solver'
  | 'unit-metals'
  | 'materials-engineer'
  | 'unit-atoms'
  | 'element-detective'
  | 'unit-motion'
  | 'race-analyst'
  | 'unit-forces'
  | 'force-fixer'
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
  'unit-changes': { title: 'Change Master', emoji: '⚗️', description: 'Mastered every core topic in Unit 3: Physical & Chemical Changes' },
  'fire-officer': { title: 'Fire Safety Officer', emoji: '🧑‍🚒', description: 'Handled all six fire emergencies (Boss Challenge)' },
  'unit-acids': { title: 'pH Pro', emoji: '🧫', description: 'Mastered every core topic in Unit 4: Acids, Bases & Salts' },
  'mystery-solver': { title: 'Mystery Solver', emoji: '🕵️', description: 'Identified all six mystery bottles (Boss Challenge)' },
  'unit-metals': { title: 'Metal Master', emoji: '🔩', description: 'Mastered every core topic in Unit 5: Metals, Non-metals & Materials' },
  'materials-engineer': { title: 'Materials Engineer', emoji: '👷', description: 'Approved at least 4 of 6 engineering designs (Boss Challenge)' },
  'unit-atoms': { title: 'Atom Architect', emoji: '⚛️', description: 'Mastered every core topic in Unit 6: Atoms & the Periodic Table' },
  'element-detective': { title: 'Element Detective', emoji: '🔎', description: 'Solved the Element Detective mysteries (Boss Challenge)' },
  'unit-motion': { title: 'Motion Master', emoji: '🏃', description: 'Mastered every core topic in Physics Unit 1: Measurement & Motion' },
  'race-analyst': { title: 'Race Analyst', emoji: '🏁', description: 'Read the Great Bengaluru Race graph like a scientist (Boss Challenge)' },
  'unit-forces': { title: 'Force Master', emoji: '💪', description: 'Mastered every core topic in Physics Unit 2: Forces & Pressure' },
  'force-fixer': { title: 'Force Fixer', emoji: '🛠️', description: 'Solved eight real-world force and pressure problems (Boss Challenge)' },
  'perfect-score': { title: 'Flawless', emoji: '💎', description: 'Scored 100% on a practice set' },
}
