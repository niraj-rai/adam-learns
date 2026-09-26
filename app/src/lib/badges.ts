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
  | 'unit-energy'
  | 'cool-house-architect'
  | 'unit-light'
  | 'light-bender'
  | 'unit-sound'
  | 'sonar-captain'
  | 'unit-electricity'
  | 'circuit-detective'
  | 'unit-space'
  | 'moon-commander'
  | 'unit-living-things'
  | 'field-naturalist'
  | 'unit-cells'
  | 'slide-sleuth'
  | 'unit-microbes'
  | 'microbe-master'
  | 'unit-nutrition'
  | 'diet-doctor'
  | 'unit-body'
  | 'marathon-medic'
  | 'unit-health'
  | 'disease-detective'
  | 'unit-reproduction'
  | 'master-gardener'
  | 'unit-ecosystems'
  | 'forest-keeper'
  | 'unit-number-systems'
  | 'number-ninja'
  | 'unit-squares-and-roots'
  | 'root-raider'
  | 'unit-powers'
  | 'power-surge'
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
  'unit-energy': { title: 'Heat Wave', emoji: '🔥', description: 'Mastered every core topic in Physics Unit 3: Energy, Heat & Temperature' },
  'cool-house-architect': { title: 'Cool House Architect', emoji: '🏡', description: 'Designed comfortable homes for Chennai summers and Delhi winters (Boss Challenge)' },
  'unit-light': { title: 'Ray Tracer', emoji: '🔦', description: 'Mastered every core topic in Physics Unit 4: Light' },
  'light-bender': { title: 'Light Bender', emoji: '🪞', description: 'Cleared all five Laser Maze levels (Boss Challenge)' },
  'unit-sound': { title: 'Sound Wave', emoji: '🎵', description: 'Mastered every core topic in Physics Unit 5: Sound' },
  'sonar-captain': { title: 'Sonar Captain', emoji: '🚢', description: 'Mapped the seabed with echoes and found the shipwreck (Boss Challenge)' },
  'unit-electricity': { title: 'Live Wire', emoji: '⚡', description: 'Mastered every core topic in Physics Unit 6: Electricity & Magnetism' },
  'circuit-detective': { title: 'Circuit Detective', emoji: '🕵️', description: 'Found and fixed the fault in seven broken circuits (Boss Challenge)' },
  'unit-space': { title: 'Star Gazer', emoji: '🔭', description: 'Mastered every core topic in Physics Unit 7: Earth & Space' },
  'moon-commander': { title: 'Moon Commander', emoji: '🌕', description: 'Positioned the Moon for phases and eclipses in all eight missions (Boss Challenge)' },
  'unit-living-things': { title: 'Life Detective', emoji: '🌿', description: 'Mastered every core topic in Biology Unit 1: Living Things & Classification' },
  'field-naturalist': { title: 'Field Naturalist', emoji: '🔭', description: 'Identified eight Western Ghats organisms with a key (Boss Challenge)' },
  'unit-cells': { title: 'Cell Scientist', emoji: '🔬', description: 'Mastered every core topic in Biology Unit 2: Cells' },
  'slide-sleuth': { title: 'Slide Sleuth', emoji: '🧫', description: 'Identified six mystery microscope slides (Boss Challenge)' },
  'unit-microbes': { title: 'Microbe Hunter', emoji: '🦠', description: 'Mastered every core topic in Biology Unit 3: Microorganisms' },
  'microbe-master': { title: 'Microbe Master Chef', emoji: '👩‍🍳', description: 'Used friendly microbes and food safety to complete three kitchen orders (Boss Challenge)' },
  'unit-nutrition': { title: 'Nutrition Ninja', emoji: '🥗', description: 'Mastered every core topic in Biology Unit 4: Nutrition' },
  'diet-doctor': { title: 'Diet Doctor', emoji: '🩺', description: 'Diagnosed six nutrient deficiencies and prescribed the right foods (Boss Challenge)' },
  'unit-body': { title: 'Body Engineer', emoji: '🫀', description: 'Mastered every core topic in Biology Unit 5: Human Body Systems' },
  'marathon-medic': { title: 'Marathon Medic', emoji: '🏅', description: 'Guided a runner safely through a half marathon by reading their body systems (Boss Challenge)' },
  'unit-health': { title: 'Health Guardian', emoji: '🛡️', description: 'Mastered every core topic in Biology Unit 6: Health & Disease' },
  'disease-detective': { title: 'Disease Detective', emoji: '🕵️‍♀️', description: 'Traced a cholera outbreak to its source and stopped it (Boss Challenge)' },
  'unit-reproduction': { title: 'Life Cycle Expert', emoji: '🌸', description: 'Mastered every core topic in Biology Unit 7: Reproduction and Adolescence' },
  'master-gardener': { title: 'Master Gardener', emoji: '🌻', description: 'Solved six garden problems using plant reproduction (Boss Challenge)' },
  'unit-ecosystems': { title: 'Eco Guardian', emoji: '🌏', description: 'Mastered every core topic in Biology Unit 8: Ecosystems and Conservation' },
  'forest-keeper': { title: 'Forest Keeper', emoji: '🐅', description: 'Restored the balance of grass, deer and tigers in a reserve (Boss Challenge)' },
  'unit-number-systems': { title: 'Number Navigator', emoji: '🧭', description: 'Mastered every core topic in Maths Unit 1: Integers, Fractions and Rational Numbers' },
  'number-ninja': { title: 'Number Ninja', emoji: '🥷', description: 'Solved ten tricky number problems (Boss Challenge)' },
  'unit-squares-and-roots': { title: 'Square Shaper', emoji: '🟪', description: 'Mastered every core topic in Maths Unit 2: Squares, Cubes and Roots' },
  'root-raider': { title: 'Root Raider', emoji: '🏴‍☠️', description: 'Solved ten problems on squares, cubes and roots (Boss Challenge)' },
  'unit-powers': { title: 'Power Player', emoji: '🚀', description: 'Mastered every core topic in Maths Unit 3: Powers and Exponents' },
  'power-surge': { title: 'Power Surge', emoji: '⚡', description: 'Solved ten problems on exponents and standard form (Boss Challenge)' },
  'perfect-score': { title: 'Flawless', emoji: '💎', description: 'Scored 100% on a practice set' },
}
