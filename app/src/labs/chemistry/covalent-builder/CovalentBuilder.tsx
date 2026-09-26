import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** a, b: the two atoms drawn; pairs: electron pairs shared between them. */
type Mol = { id: string; name: string; formula: string; shared: number; bond: string; lone: number; structure: string; note: string; a: string; b: string; pairs: number }
const MOLS: Mol[] = [
  { id: 'H2', name: 'Hydrogen', formula: 'H₂', shared: 1, bond: 'single', lone: 0, structure: 'H–H', note: 'Each H shares its one electron, so both have 2 (like helium).', a: 'H', b: 'H', pairs: 1 },
  { id: 'Cl2', name: 'Chlorine', formula: 'Cl₂', shared: 1, bond: 'single', lone: 6, structure: 'Cl–Cl', note: 'Each Cl has 7 outer electrons and shares one pair to reach 8.', a: 'Cl', b: 'Cl', pairs: 1 },
  { id: 'O2', name: 'Oxygen', formula: 'O₂', shared: 2, bond: 'double', lone: 4, structure: 'O=O', note: 'Each O needs 2 more, so they share two pairs: a double bond.', a: 'O', b: 'O', pairs: 2 },
  { id: 'N2', name: 'Nitrogen', formula: 'N₂', shared: 3, bond: 'triple', lone: 2, structure: 'N≡N', note: 'Each N needs 3 more: a very strong triple bond. That’s why N₂ is unreactive.', a: 'N', b: 'N', pairs: 3 },
  { id: 'H2O', name: 'Water', formula: 'H₂O', shared: 2, bond: 'two single', lone: 2, structure: 'H–O–H', note: 'Oxygen shares one pair with each hydrogen and keeps two lone pairs.', a: 'O', b: 'H', pairs: 1 },
  { id: 'NH3', name: 'Ammonia', formula: 'NH₃', shared: 3, bond: 'three single', lone: 1, structure: 'H–N(–H)–H', note: 'Nitrogen shares three pairs and keeps one lone pair.', a: 'N', b: 'H', pairs: 1 },
  { id: 'CH4', name: 'Methane', formula: 'CH₄', shared: 4, bond: 'four single', lone: 0, structure: 'CH₄ (tetrahedral)', note: 'Carbon has 4 outer electrons and shares all four: valency 4.', a: 'C', b: 'H', pairs: 1 },
  { id: 'CO2', name: 'Carbon dioxide', formula: 'CO₂', shared: 4, bond: 'two double', lone: 4, structure: 'O=C=O', note: 'Carbon forms a double bond with each oxygen.', a: 'C', b: 'O', pairs: 2 },
]
const ALLOTROPES = [
  { name: 'Diamond', emoji: '💎', text: 'Each carbon bonded to 4 others in a rigid 3D network: the hardest natural substance; doesn’t conduct.' },
  { name: 'Graphite', emoji: '✏️', text: 'Layers of hexagons, each carbon bonded to 3 others; layers slide (pencil lead, lubricant); conducts electricity.' },
  { name: 'Fullerene (C₆₀)', emoji: '⚽', text: 'Carbon atoms in a football-shaped cage, named after the architect Buckminster Fuller.' },
]

/** Electron-dot sketch: two atom circles with shared pairs in the overlap. */
function Dots({ m }: { m: Mol }) {
  const partial = m.shared !== m.pairs
  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-sm" role="img" aria-label={`${m.name}: ${m.shared} shared pair(s)`}>
      <circle cx={90} cy={70} r={46} fill="#6366f1" fillOpacity={0.12} stroke="#6366f1" />
      <circle cx={150} cy={70} r={46} fill="#10b981" fillOpacity={0.12} stroke="#10b981" />
      {Array.from({ length: m.pairs }, (_, k) => <g key={k}><circle cx={116} cy={52 + k * 18} r={4} fill="#6366f1" /><circle cx={124} cy={52 + k * 18} r={4} fill="#10b981" /></g>)}
      <text x={80} y={74} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">{m.a}</text>
      <text x={160} y={74} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">{m.b}</text>
      <text x={120} y={134} textAnchor="middle" fontSize={11} fill="currentColor">{partial ? `one ${m.a}–${m.b} bond: ${m.pairs} shared pair${m.pairs > 1 ? 's' : ''}` : `${m.pairs} shared pair${m.pairs > 1 ? 's' : ''}`}</text>
    </svg>
  )
}

export default function CovalentBuilder() {
  const [id, setId] = useState('CH4')
  const m = MOLS.find((x) => x.id === id)!
  return (
    <LabFrame labId="covalent-builder" title="Covalent Bonds" subtitle="Non-metal atoms share pairs of electrons so that each gets a full outer shell." howTo={<p>Choose a molecule to see how many electron pairs are shared and how many lone pairs are left. Then compare carbon's allotropes.</p>}>
      <div className="flex flex-wrap gap-1">{MOLS.map((x) => <button key={x.id} type="button" aria-pressed={id === x.id} onClick={() => setId(x.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', id === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name} {x.formula}</button>)}</div>
      <div className="mt-3 grid items-center gap-4 md:grid-cols-[1fr_1fr]">
        <Dots m={m} />
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Structure" value={<span className="font-mono">{m.structure}</span>} />
            <Readout label="Bond(s)" value={m.bond} />
            <Readout label="Shared pairs in total" value={m.shared} />
            <Readout label="Lone pairs in total" value={m.lone} />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">{m.note}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{ALLOTROPES.map((a) => <div key={a.name} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{a.emoji} {a.name}</p><p className="mt-1 text-xs text-muted-foreground">{a.text}</p></div>)}</div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Covalent compounds (made of molecules) usually have <b>low melting and boiling points</b> and <b>don't conduct electricity</b>, because there are no free ions. Carbon forms millions of compounds because of <b>catenation</b> (linking to other carbons in chains and rings) and its <b>valency of 4</b>.</p>
    </LabFrame>
  )
}
