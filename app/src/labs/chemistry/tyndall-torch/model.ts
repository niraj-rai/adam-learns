export type Kind = 'solution' | 'colloid' | 'suspension'

export type Sample = { id: string; name: string; emoji: string; kind: Kind; colour: string; note: string }

export const SAMPLES: Sample[] = [
  { id: 'salt', name: 'Salt water', emoji: '🧂', kind: 'solution', colour: '#e0f2fe', note: 'Salt breaks up into ions far too small to scatter light.' },
  { id: 'copper', name: 'Copper sulfate solution', emoji: '💙', kind: 'solution', colour: '#7dd3fc', note: 'Coloured but clear: you can see straight through it.' },
  { id: 'milk', name: 'Diluted milk', emoji: '🥛', kind: 'colloid', colour: '#f8fafc', note: 'Tiny fat and protein droplets stay spread out and scatter light.' },
  { id: 'starch', name: 'Starch in hot water', emoji: '🍚', kind: 'colloid', colour: '#f1f5f9', note: 'Starch molecules are huge, so they scatter a torch beam.' },
  { id: 'mud', name: 'Muddy water', emoji: '🟤', kind: 'suspension', colour: '#a16207', note: 'Soil particles are big enough to see, and they sink.' },
  { id: 'chalk', name: 'Chalk powder in water', emoji: '🩶', kind: 'suspension', colour: '#e5e7eb', note: 'Chalk doesn’t dissolve; the particles settle at the bottom.' },
]

/** What you observe for each kind of mixture. */
export const PROPS: Record<Kind, { size: string; beam: boolean; settles: boolean; filter: boolean; clear: boolean }> = {
  solution: { size: 'less than 1 nm', beam: false, settles: false, filter: false, clear: true },
  colloid: { size: '1 nm – 1000 nm', beam: true, settles: false, filter: false, clear: false },
  suspension: { size: 'more than 1000 nm', beam: true, settles: true, filter: true, clear: false },
}
