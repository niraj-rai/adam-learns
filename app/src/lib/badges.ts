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
  | 'unit-algebra'
  | 'algebra-quest'
  | 'unit-equations'
  | 'equation-escape'
  | 'unit-proportion'
  | 'market-master'
  | 'unit-geometry'
  | 'geometry-guardian'
  | 'unit-mensuration'
  | 'space-architect'
  | 'unit-data'
  | 'data-detective'
  | 'unit-kinematics'
  | 'motion-master'
  | 'unit-forces-and-laws'
  | 'force-master'
  | 'unit-work-and-energy'
  | 'energy-master'
  | 'unit-sound-waves'
  | 'sound-master'
  | 'unit-mixtures-in-depth'
  | 'mixture-master'
  | 'unit-atoms-and-moles'
  | 'mole-master'
  | 'unit-cells-and-tissues'
  | 'tissue-master'
  | 'unit-diversity'
  | 'classification-master'
  | 'unit-life-continues'
  | 'life-master'
  | 'unit-real-numbers'
  | 'real-number-rumble'
  | 'unit-coordinate-geometry'
  | 'coordinate-commander'
  | 'unit-polynomials'
  | 'polynomial-power'
  | 'unit-euclid-geometry'
  | 'proof-master'
  | 'unit-area-and-solids'
  | 'solid-master'
  | 'unit-patterns-and-chance'
  | 'chance-master'
  | 'unit-reflection-refraction'
  | 'unit-current-electricity'
  | 'circuit-master'
  | 'unit-reactions-and-equations'
  | 'reactions-master'
  | 'unit-salts-and-metals'
  | 'salts-metals-master'
  | 'unit-carbon-compounds'
  | 'carbon-master'
  | 'unit-life-processes'
  | 'life-processes-master'
  | 'unit-coordination-and-heredity'
  | 'heredity-master'
  | 'unit-our-environment'
  | 'environment-master'
  | 'light-master'
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
  'unit-algebra': { title: 'Algebra Architect', emoji: '🏗️', description: 'Mastered every core topic in Maths Unit 4: Algebra: Expressions and Identities' },
  'algebra-quest': { title: 'Algebra Champion', emoji: '🏆', description: 'Solved ten problems on expressions, identities and factorising (Boss Challenge)' },
  'unit-equations': { title: 'Equation Master', emoji: '⚖️', description: 'Mastered every core topic in Maths Unit 5: Linear Equations and Graphs' },
  'equation-escape': { title: 'Escape Artist', emoji: '🗝️', description: 'Opened ten locks with equations and graphs (Boss Challenge)' },
  'unit-proportion': { title: 'Proportion Pro', emoji: '⚗️', description: 'Mastered every core topic in Maths Unit 6: Ratio, Proportion and Percentages' },
  'market-master': { title: 'Market Master', emoji: '🏪', description: 'Solved ten real-life ratio and percentage problems (Boss Challenge)' },
  'unit-geometry': { title: 'Shape Sage', emoji: '📐', description: 'Mastered every core topic in Maths Unit 7: Geometry: Angles, Shapes and Pythagoras' },
  'geometry-guardian': { title: 'Geometry Guardian', emoji: '🛡️', description: 'Solved ten geometry problems (Boss Challenge)' },
  'unit-mensuration': { title: 'Master Measurer', emoji: '📏', description: 'Mastered every core topic in Maths Unit 8: Mensuration' },
  'space-architect': { title: 'Space Architect', emoji: '🏗️', description: 'Solved ten area, surface area and volume problems (Boss Challenge)' },
  'unit-data': { title: 'Data Scientist', emoji: '📊', description: 'Mastered every core topic in Maths Unit 9: Data Handling and Probability' },
  'data-detective': { title: 'Data Detective', emoji: '🕵️', description: 'Cracked ten cases on averages, charts and chance (Boss Challenge)' },
  'unit-kinematics': { title: 'Kinematics Expert', emoji: '🚀', description: 'Mastered every core topic in Grade 9 Physics Unit 8: Describing Motion' },
  'motion-master': { title: 'Motion Master', emoji: '🏎️', description: 'Solved ten Grade 9 motion problems (Boss Challenge)' },
  'unit-forces-and-laws': { title: 'Newton’s Apprentice', emoji: '🍎', description: 'Mastered every core topic in Grade 9 Physics Unit 9: Forces and Newton’s Laws' },
  'force-master': { title: 'Force Master', emoji: '🏋️', description: 'Solved ten Grade 9 force and momentum problems (Boss Challenge)' },
  'unit-work-and-energy': { title: 'Energy Engineer', emoji: '⚙️', description: 'Mastered every core topic in Grade 9 Physics Unit 10: Work, Energy and Simple Machines' },
  'energy-master': { title: 'Energy Master', emoji: '⚡', description: 'Solved ten Grade 9 work, energy and power problems (Boss Challenge)' },
  'unit-sound-waves': { title: 'Wave Rider', emoji: '🌊', description: 'Mastered every core topic in Grade 9 Physics Unit 11: Sound Waves' },
  'sound-master': { title: 'Sound Master', emoji: '🎧', description: 'Solved ten Grade 9 sound problems (Boss Challenge)' },
  'unit-mixtures-in-depth': { title: 'Solution Specialist', emoji: '🧪', description: 'Mastered every core topic in Grade 9 Chemistry Unit 7: Solutions, Colloids and Suspensions' },
  'mixture-master': { title: 'Mixture Master', emoji: '🥛', description: 'Solved ten Grade 9 mixtures problems (Boss Challenge)' },
  'unit-atoms-and-moles': { title: 'Mole Counter', emoji: '⚛️', description: 'Mastered every core topic in Grade 9 Chemistry Unit 8: Atoms, Molecules and the Mole' },
  'mole-master': { title: 'Mole Master', emoji: '🧺', description: 'Solved ten Grade 9 formula and mole problems (Boss Challenge)' },
  'unit-cells-and-tissues': { title: 'Tissue Expert', emoji: '🧫', description: 'Mastered every core topic in Grade 9 Biology Unit 9: Cells and Tissues in Action' },
  'tissue-master': { title: 'Tissue Master', emoji: '🔬', description: 'Solved ten Grade 9 cells and tissues problems (Boss Challenge)' },
  'unit-diversity': { title: 'Taxonomist', emoji: '🪜', description: 'Mastered every core topic in Grade 9 Biology Unit 10: Diversity and Classification' },
  'classification-master': { title: 'Classification Master', emoji: '🦚', description: 'Solved ten Grade 9 classification problems (Boss Challenge)' },
  'unit-life-continues': { title: 'Life Cycle Expert', emoji: '🌸', description: 'Mastered every core topic in Grade 9 Biology Unit 11: Reproduction' },
  'life-master': { title: 'Life Cycle Master', emoji: '🌺', description: 'Solved ten Grade 9 reproduction problems (Boss Challenge)' },
  'unit-real-numbers': { title: "Real Number Ranger", emoji: '♾️', description: "Mastered every core topic in Grade 9 Maths Unit 10: Real Numbers" },
  'real-number-rumble': { title: "Real Number Rumble", emoji: '🥊', description: "Solved ten Grade 9 real number problems (Boss Challenge)" },
  'unit-coordinate-geometry': { title: "Coordinate Captain", emoji: '🧭', description: "Mastered every core topic in Grade 9 Maths Unit 11: Coordinates and Linear Equations" },
  'coordinate-commander': { title: "Coordinate Commander", emoji: '🎖️', description: "Solved ten Grade 9 coordinate problems (Boss Challenge)" },
  'unit-polynomials': { title: "Polynomial Pro", emoji: '🧊', description: "Mastered every core topic in Grade 9 Maths Unit 12: Polynomials" },
  'polynomial-power': { title: "Polynomial Power", emoji: '⚡', description: "Solved ten Grade 9 polynomial problems (Boss Challenge)" },
  'unit-euclid-geometry': { title: "Geometer", emoji: '📐', description: "Mastered every core topic in Grade 9 Maths Unit 13: Euclid’s Geometry, Triangles and Circles" },
  'proof-master': { title: "Proof Master", emoji: '🧱', description: "Solved ten Grade 9 geometry problems (Boss Challenge)" },
  'unit-area-and-solids': { title: "Measure Master", emoji: '🏺', description: "Mastered every core topic in Grade 9 Maths Unit 14: Area, Surface Area and Volume" },
  'solid-master': { title: "Solid Master", emoji: '🍦', description: "Solved ten Grade 9 mensuration problems (Boss Challenge)" },
  'unit-patterns-and-chance': { title: "Pattern Seer", emoji: '🔮', description: "Mastered every core topic in Grade 9 Maths Unit 15: Sequences, Statistics and Probability" },
  'chance-master': { title: "Chance Master", emoji: '🎲', description: "Solved ten Grade 9 sequences and probability problems (Boss Challenge)" },
  'unit-reflection-refraction': { title: "Optics Expert", emoji: '🔦', description: "Mastered every core topic in Grade 10 Physics Unit 12: Light, the Eye and Colour" },
  'light-master': { title: "Light Master", emoji: '🌈', description: "Solved ten Grade 10 light problems (Boss Challenge)" },
  'unit-current-electricity': { title: "Electrician", emoji: '🔌', description: "Mastered every core topic in Grade 10 Physics Unit 13: Electricity and Magnetism" },
  'circuit-master': { title: "Circuit Master", emoji: '⚡', description: "Solved ten Grade 10 electricity problems (Boss Challenge)" },
  'unit-reactions-and-equations': { title: "Equation Expert", emoji: '⚖️', description: "Mastered every core topic in Grade 10 Chemistry Unit 9: Chemical Reactions and Equations" },
  'reactions-master': { title: "Reaction Master", emoji: '⚗️', description: "Solved ten Grade 10 reaction problems (Boss Challenge)" },
  'unit-salts-and-metals': { title: "Salt and Metal Specialist", emoji: '⛏️', description: "Mastered every core topic in Grade 10 Chemistry Unit 10: Acids, Salts and Metals in Depth" },
  'salts-metals-master': { title: "Salts and Metals Master", emoji: '🧂', description: "Solved ten Grade 10 salts and metals problems (Boss Challenge)" },
  'unit-carbon-compounds': { title: "Carbon Chemist", emoji: '🧬', description: "Mastered every core topic in Grade 10 Chemistry Unit 11: Carbon and Its Compounds" },
  'carbon-master': { title: "Carbon Master", emoji: '🔗', description: "Solved ten Grade 10 carbon chemistry problems (Boss Challenge)" },
  'unit-life-processes': { title: "Life Processes Expert", emoji: '🫀', description: "Mastered every core topic in Grade 10 Biology Unit 12: Life Processes" },
  'life-processes-master': { title: "Life Processes Master", emoji: '🫀', description: "Solved ten Grade 10 life processes problems (Boss Challenge)" },
  'unit-coordination-and-heredity': { title: "Nerve and Gene Expert", emoji: '🧠', description: "Mastered every core topic in Grade 10 Biology Unit 13: Control, Coordination and Heredity" },
  'heredity-master': { title: "Heredity Master", emoji: '🧬', description: "Solved ten Grade 10 coordination and heredity problems (Boss Challenge)" },
  'unit-our-environment': { title: "Earth Guardian", emoji: '🌍', description: "Mastered every core topic in Grade 10 Biology Unit 14: Our Environment" },
  'environment-master': { title: "Environment Master", emoji: '🌍', description: "Solved ten Grade 10 environment problems (Boss Challenge)" },
  'perfect-score': { title: 'Flawless', emoji: '💎', description: 'Scored 100% on a practice set' },
}
