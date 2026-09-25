export type Atom = 'Au' | 'O' | 'H' | 'Na' | 'Cl' | 'C' | 'N' | 'Ar' | 'Cu' | 'Zn'

export const ATOMS: Record<Atom, { r: number; fill: string; label: string }> = {
  Au: { r: 8, fill: '#eab308', label: 'gold atom' },
  O: { r: 6.5, fill: '#ef4444', label: 'oxygen atom' },
  H: { r: 4, fill: '#f8fafc', label: 'hydrogen atom' },
  Na: { r: 5.5, fill: '#a855f7', label: 'sodium' },
  Cl: { r: 7.5, fill: '#22c55e', label: 'chlorine' },
  C: { r: 6.5, fill: '#334155', label: 'carbon atom' },
  N: { r: 6.5, fill: '#3b82f6', label: 'nitrogen atom' },
  Ar: { r: 6.5, fill: '#f472b6', label: 'argon atom' },
  Cu: { r: 8, fill: '#c2410c', label: 'copper atom' },
  Zn: { r: 8, fill: '#94a3b8', label: 'zinc atom' },
}

/** A particle is one atom or a small molecule made of atoms at offsets from its centre. */
export type Particle = { name: string; atoms: { a: Atom; dx: number; dy: number }[] }

export const P: Record<string, Particle> = {
  Au: { name: 'gold atom', atoms: [{ a: 'Au', dx: 0, dy: 0 }] },
  Cu: { name: 'copper atom', atoms: [{ a: 'Cu', dx: 0, dy: 0 }] },
  Zn: { name: 'zinc atom', atoms: [{ a: 'Zn', dx: 0, dy: 0 }] },
  Ar: { name: 'argon atom', atoms: [{ a: 'Ar', dx: 0, dy: 0 }] },
  Na: { name: 'sodium', atoms: [{ a: 'Na', dx: 0, dy: 0 }] },
  Cl: { name: 'chlorine', atoms: [{ a: 'Cl', dx: 0, dy: 0 }] },
  O2: { name: 'oxygen molecule (O₂)', atoms: [{ a: 'O', dx: -5.5, dy: 0 }, { a: 'O', dx: 5.5, dy: 0 }] },
  N2: { name: 'nitrogen molecule (N₂)', atoms: [{ a: 'N', dx: -5.5, dy: 0 }, { a: 'N', dx: 5.5, dy: 0 }] },
  H2O: { name: 'water molecule (H₂O)', atoms: [{ a: 'O', dx: 0, dy: -1 }, { a: 'H', dx: -7, dy: 5 }, { a: 'H', dx: 7, dy: 5 }] },
  CO2: { name: 'carbon dioxide molecule (CO₂)', atoms: [{ a: 'O', dx: -11, dy: 0 }, { a: 'C', dx: 0, dy: 0 }, { a: 'O', dx: 11, dy: 0 }] },
  H2: { name: 'hydrogen molecule (H₂)', atoms: [{ a: 'H', dx: -3.5, dy: 0 }, { a: 'H', dx: 3.5, dy: 0 }] },
}

export type Kind = 'element' | 'compound' | 'mixture'

export type Sample = {
  id: string
  name: string
  emoji: string
  state: 'solid' | 'liquid' | 'gas'
  kind: Kind
  /** e.g. homogeneous mixtures look the same everywhere even under a microscope */
  microscope: string
  /** particles and their share of the picture */
  mix: { p: keyof typeof P; share: number }[]
  /** solid lattices: 'alternate' for ionic (NaCl), 'random' for alloys */
  lattice?: 'single' | 'alternate' | 'random'
  explain: string
}

export const SAMPLES: Sample[] = [
  {
    id: 'gold',
    name: 'Gold coin',
    emoji: '🪙',
    state: 'solid',
    kind: 'element',
    lattice: 'single',
    mix: [{ p: 'Au', share: 1 }],
    microscope: 'Shiny and the same everywhere.',
    explain: 'Only ONE kind of atom (gold). A substance made of just one kind of atom is an element, and it is pure.',
  },
  {
    id: 'oxygen',
    name: 'Oxygen gas',
    emoji: '🫧',
    state: 'gas',
    kind: 'element',
    mix: [{ p: 'O2', share: 1 }],
    microscope: 'Invisible: nothing to see!',
    explain: 'Every particle is an O₂ molecule made of two oxygen atoms. Only one kind of atom → element. All particles identical → pure.',
  },
  {
    id: 'water',
    name: 'Pure (distilled) water',
    emoji: '💧',
    state: 'liquid',
    kind: 'compound',
    mix: [{ p: 'H2O', share: 1 }],
    microscope: 'Clear and the same everywhere.',
    explain: 'Every particle is an identical H₂O molecule: two hydrogen atoms chemically joined to one oxygen atom. Two kinds of atom joined together → compound. All particles identical → pure.',
  },
  {
    id: 'salt',
    name: 'Table salt',
    emoji: '🧂',
    state: 'solid',
    kind: 'compound',
    lattice: 'alternate',
    mix: [
      { p: 'Na', share: 0.5 },
      { p: 'Cl', share: 0.5 },
    ],
    microscope: 'Tiny identical cube-shaped crystals.',
    explain: 'Sodium and chlorine are chemically joined in a fixed 1 : 1 pattern (sodium chloride, NaCl). Joined in a fixed ratio → compound. Pure.',
  },
  {
    id: 'co2',
    name: 'Carbon dioxide',
    emoji: '💨',
    state: 'gas',
    kind: 'compound',
    mix: [{ p: 'CO2', share: 1 }],
    microscope: 'Invisible gas.',
    explain: 'Every particle is a CO₂ molecule: one carbon atom joined to two oxygen atoms → compound. All particles the same → pure.',
  },
  {
    id: 'air',
    name: 'Air',
    emoji: '🌬️',
    state: 'gas',
    kind: 'mixture',
    mix: [
      { p: 'N2', share: 0.72 },
      { p: 'O2', share: 0.2 },
      { p: 'Ar', share: 0.05 },
      { p: 'CO2', share: 0.03 },
    ],
    microscope: 'Invisible gas.',
    explain: 'Air contains DIFFERENT kinds of particles (N₂, O₂, argon, CO₂…) that are not joined together. Different particles just mixed → mixture. (About 78% nitrogen and 21% oxygen.)',
  },
  {
    id: 'saltwater',
    name: 'Salt water',
    emoji: '🌊',
    state: 'liquid',
    kind: 'mixture',
    mix: [
      { p: 'H2O', share: 0.8 },
      { p: 'Na', share: 0.1 },
      { p: 'Cl', share: 0.1 },
    ],
    microscope: 'Clear, and it looks exactly like pure water! You cannot see the salt.',
    explain: 'Water molecules with sodium and chloride particles spread between them, not chemically joined. It is a mixture, even though it looks pure. This is a homogeneous mixture (a solution).',
  },
  {
    id: 'brass',
    name: 'Brass (a tap or diya)',
    emoji: '🪔',
    state: 'solid',
    kind: 'mixture',
    lattice: 'random',
    mix: [
      { p: 'Cu', share: 0.65 },
      { p: 'Zn', share: 0.35 },
    ],
    microscope: 'Shiny golden metal, the same everywhere.',
    explain: 'Brass is an alloy: copper and zinc atoms mixed together in the metal, NOT chemically joined. The amounts can vary → mixture.',
  },
]

/** Simple seeded random so each sample always draws the same picture. */
export function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

export type Placed = { x: number; y: number; rot: number; p: keyof typeof P }

export function layout(sample: Sample, w: number, h: number): Placed[] {
  const rand = seeded(sample.id.split('').reduce((a, c) => a + c.charCodeAt(0), 7))
  const pick = () => {
    const r = rand()
    let acc = 0
    for (const m of sample.mix) {
      acc += m.share
      if (r <= acc) return m.p
    }
    return sample.mix[sample.mix.length - 1].p
  }
  const out: Placed[] = []
  if (sample.state === 'solid') {
    const step = sample.lattice === 'alternate' ? 15 : 17
    const cols = Math.floor((w - 20) / step)
    const rows = Math.floor((h - 20) / step)
    const x0 = (w - (cols - 1) * step) / 2
    const y0 = (h - (rows - 1) * step) / 2
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const p = sample.lattice === 'alternate' ? ((r + c) % 2 ? 'Na' : 'Cl') : sample.lattice === 'random' ? pick() : sample.mix[0].p
        out.push({ x: x0 + c * step, y: y0 + r * step, rot: 0, p })
      }
    return out
  }
  if (sample.state === 'liquid') {
    const step = 21
    const cols = Math.floor((w - 16) / step)
    const rows = Math.floor((h - 16) / step)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        out.push({
          x: 14 + c * step + (r % 2 ? step / 2 : 0) + (rand() - 0.5) * 6,
          y: 14 + r * step + (rand() - 0.5) * 6,
          rot: rand() * 360,
          p: pick(),
        })
      }
    return out.filter((p) => p.x < w - 8)
  }
  // gas: few particles far apart, avoid overlaps
  const n = 16
  let tries = 0
  while (out.length < n && tries < 2000) {
    tries++
    const x = 20 + rand() * (w - 40)
    const y = 20 + rand() * (h - 40)
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < 38)) continue
    out.push({ x, y, rot: rand() * 360, p: pick() })
  }
  return out
}
