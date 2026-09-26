import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const CASES = [
  { eq: 'CuO + H₂ → Cu + H₂O', species: ['CuO', 'H₂'], oxidised: 'H₂', why: 'H₂ gains oxygen (becomes H₂O); CuO loses oxygen (becomes Cu), so CuO is reduced.' },
  { eq: 'ZnO + C → Zn + CO', species: ['ZnO', 'C'], oxidised: 'C', why: 'Carbon gains oxygen; zinc oxide loses it. This is how zinc is extracted.' },
  { eq: '2Mg + O₂ → 2MgO', species: ['Mg', 'O₂'], oxidised: 'Mg', why: 'Magnesium gains oxygen, so it is oxidised; oxygen is reduced.' },
  { eq: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂', species: ['Fe₂O₃', 'CO'], oxidised: 'CO', why: 'In a blast furnace, CO gains oxygen and iron oxide is reduced to iron.' },
  { eq: 'MnO₂ + 4HCl → MnCl₂ + 2H₂O + Cl₂', species: ['MnO₂', 'HCl'], oxidised: 'HCl', why: 'HCl loses hydrogen (to become Cl₂), so it is oxidised; MnO₂ loses oxygen, so it is reduced.' },
]
const EVERYDAY = [
  { name: 'Corrosion (rusting)', emoji: '🔩', text: 'Iron slowly reacts with oxygen and water to form hydrated iron(III) oxide (rust). Painting, oiling, galvanising and alloying (stainless steel) prevent it.' },
  { name: 'Rancidity', emoji: '🍟', text: 'Fats and oils in food are oxidised and start to smell and taste bad. Chips packets are filled with nitrogen, and antioxidants or airtight containers slow it down.' },
  { name: 'Silver tarnish', emoji: '🥈', text: 'Silver turns black as it reacts with sulfur compounds in the air to form silver sulfide.' },
]

export default function RedoxDetective() {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const c = CASES[i % CASES.length]
  const choose = (s: string) => { if (picked) return; setPicked(s); if (s === c.oxidised) sfx.correct(); else sfx.wrong() }
  return (
    <LabFrame labId="redox-detective" title="Redox Detective" subtitle="Oxidation is gain of oxygen (or loss of hydrogen); reduction is loss of oxygen (or gain of hydrogen). They always happen together." howTo={<p>For each reaction, find the substance that is oxidised. The other reactant is reduced. Then explore redox in everyday life.</p>}>
      <div className="rounded-2xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Case {(i % CASES.length) + 1} of {CASES.length}</p><p className="mt-1 font-mono text-xl">{c.eq}</p><p className="mt-2 text-sm font-semibold">Which reactant is OXIDISED?</p></div>
      <div className="mt-2 flex flex-wrap gap-2">{c.species.map((s) => <button key={s} type="button" disabled={Boolean(picked)} onClick={() => choose(s)} className={cn('rounded-xl border-2 px-4 py-2 font-mono text-lg', !picked && 'hover:border-chem', picked && s === c.oxidised && 'border-success bg-success-soft', picked === s && s !== c.oxidised && 'border-destructive/60 bg-destructive/10')}>{s}</button>)}</div>
      {picked && <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm"><p>{picked === c.oxidised ? '✅ ' : '❌ '}{c.why}</p><Button className="mt-2" size="sm" onClick={() => { setI((x) => x + 1); setPicked(null) }}>Next case →</Button></div>}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{EVERYDAY.map((e) => <div key={e.name} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{e.emoji} {e.name}</p><p className="mt-1 text-muted-foreground">{e.text}</p></div>)}</div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Oxidation and reduction happen together, so these are called <b>redox</b> reactions. The substance that gives away oxygen (like CuO) is the <b>oxidising agent</b>; the one that takes it (like H₂) is the <b>reducing agent</b>. In later grades, you'll describe redox as the transfer of electrons.</p>
    </LabFrame>
  )
}
