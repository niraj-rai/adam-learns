import { useState } from 'react'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Method = 'electrolysis' | 'carbon' | 'heat' | 'native'
const SERIES: { sym: string; name: string; method: Method; ore: string; note: string }[] = [
  { sym: 'K', name: 'Potassium', method: 'electrolysis', ore: 'KCl (sylvite)', note: 'Very reactive: only electrolysis of the molten chloride works.' },
  { sym: 'Na', name: 'Sodium', method: 'electrolysis', ore: 'NaCl', note: 'Electrolysis of molten NaCl: sodium at the cathode, chlorine at the anode.' },
  { sym: 'Ca', name: 'Calcium', method: 'electrolysis', ore: 'CaCl₂', note: 'Too reactive for carbon to reduce.' },
  { sym: 'Mg', name: 'Magnesium', method: 'electrolysis', ore: 'MgCl₂', note: 'Electrolysis of molten magnesium chloride.' },
  { sym: 'Al', name: 'Aluminium', method: 'electrolysis', ore: 'Bauxite, Al₂O₃', note: 'Electrolysis of alumina dissolved in molten cryolite. It uses a lot of electricity.' },
  { sym: 'Zn', name: 'Zinc', method: 'carbon', ore: 'Zinc blende, ZnS', note: 'Roast the sulfide to ZnO, then reduce with carbon: ZnO + C → Zn + CO.' },
  { sym: 'Fe', name: 'Iron', method: 'carbon', ore: 'Haematite, Fe₂O₃', note: 'Blast furnace: carbon monoxide reduces iron oxide.' },
  { sym: 'Pb', name: 'Lead', method: 'carbon', ore: 'Galena, PbS', note: 'Roast, then reduce with carbon.' },
  { sym: 'Cu', name: 'Copper', method: 'heat', ore: 'Copper glance, Cu₂S', note: 'Heating the sulfide in air gives copper (self-reduction); then purified by electrolytic refining.' },
  { sym: 'Hg', name: 'Mercury', method: 'heat', ore: 'Cinnabar, HgS', note: 'Heating in air gives HgO, which decomposes on further heating to mercury.' },
  { sym: 'Ag', name: 'Silver', method: 'native', ore: 'Often found free', note: 'Very unreactive: often found as the metal itself.' },
  { sym: 'Au', name: 'Gold', method: 'native', ore: 'Found free', note: 'Found as nuggets and flakes: Karnataka’s Kolar and Hutti mines are famous.' },
]
const METHODS: { m: Method; label: string }[] = [
  { m: 'electrolysis', label: '⚡ Electrolysis of molten ore' },
  { m: 'carbon', label: '🔥 Reduce the oxide with carbon' },
  { m: 'heat', label: '♨️ Heat the ore alone' },
  { m: 'native', label: '💎 Found free (native)' },
]

export default function ExtractionFlow() {
  const [i, setI] = useState(4)
  const [answers, setAnswers] = useState<Record<string, Method>>({})
  const metal = SERIES[i]
  const choose = (m: Method) => { setAnswers((a) => ({ ...a, [metal.sym]: m })); if (m === metal.method) sfx.correct(); else sfx.wrong() }
  const got = answers[metal.sym]
  const score = SERIES.filter((s) => answers[s.sym] === s.method).length
  return (
    <LabFrame labId="extraction-flow" title="Getting Metals from Ores" subtitle="How a metal is extracted depends on where it sits in the reactivity series." howTo={<p>Pick a metal from the reactivity series (most reactive at the top). Choose how it is extracted, then read why.</p>}>
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <ol className="space-y-1">{SERIES.map((s, k) => <li key={s.sym}><button type="button" aria-pressed={i === k} onClick={() => setI(k)} className={cn('flex w-full items-center justify-between rounded-lg border px-2 py-1 text-sm', i === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}><span>{s.name}</span><span>{answers[s.sym] ? (answers[s.sym] === s.method ? '✅' : '❌') : ''}</span></button></li>)}</ol>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">↑ more reactive · less reactive ↓ · score {score}/{SERIES.length}</p>
          <div className="rounded-2xl bg-muted/50 p-4"><p className="font-heading text-2xl font-semibold">{metal.name} ({metal.sym})</p><p className="text-sm">Main ore: {metal.ore}</p></div>
          <div className="grid gap-2 sm:grid-cols-2">{METHODS.map((x) => <button key={x.m} type="button" onClick={() => choose(x.m)} className={cn('rounded-xl border-2 px-3 py-2 text-left text-sm', got === x.m && x.m === metal.method && 'border-success bg-success-soft', got === x.m && x.m !== metal.method && 'border-destructive/60 bg-destructive/10', !got && 'hover:border-chem')}>{x.label}</button>)}</div>
          {got && <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">{got === metal.method ? '✅ ' : `❌ Not quite: ${METHODS.find((x) => x.m === metal.method)!.label.slice(2).toLowerCase()}. `}{metal.note}</p>}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Steps in metallurgy: <b>concentrate</b> the ore (remove the gangue), convert it to an oxide by <b>roasting</b> (sulfides) or <b>calcination</b> (carbonates), <b>reduce</b> it to the metal, then <b>refine</b> it. In <b>electrolytic refining</b>, impure copper is the anode, pure copper the cathode, and pure copper is deposited on the cathode.</p>
    </LabFrame>
  )
}
