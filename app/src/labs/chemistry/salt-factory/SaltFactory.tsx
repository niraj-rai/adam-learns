import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ANIONS, CATIONS, ionicFormula, molarMass, pretty } from '../_shared/quantities'

const ACIDS = [
  { name: 'Hydrochloric acid', formula: 'HCl', anion: 'Chloride', strong: true },
  { name: 'Sulfuric acid', formula: 'H₂SO₄', anion: 'Sulfate', strong: true },
  { name: 'Nitric acid', formula: 'HNO₃', anion: 'Nitrate', strong: true },
  { name: 'Carbonic acid', formula: 'H₂CO₃', anion: 'Carbonate', strong: false },
]
const BASES = [
  { name: 'Sodium hydroxide', formula: 'NaOH', cation: 'Sodium', strong: true },
  { name: 'Potassium hydroxide', formula: 'KOH', cation: 'Potassium', strong: true },
  { name: 'Calcium hydroxide', formula: 'Ca(OH)₂', cation: 'Calcium', strong: true },
  { name: 'Ammonium hydroxide', formula: 'NH₄OH', cation: 'Ammonium', strong: false },
]
const FAMOUS = [
  { name: 'Baking soda', f: 'NaHCO₃', emoji: '🧁', how: 'Made from NaCl, water, CO₂ and ammonia.', use: 'Baking (releases CO₂ when heated), antacid for acidity, fire extinguishers.' },
  { name: 'Washing soda', f: 'Na₂CO₃·10H₂O', emoji: '🧺', how: 'Recrystallising sodium carbonate.', use: 'Removing hardness of water, cleaning, making glass and soap.' },
  { name: 'Bleaching powder', f: 'CaOCl₂', emoji: '🧴', how: 'Chlorine gas passed over dry slaked lime.', use: 'Disinfecting drinking water, bleaching cotton and paper.' },
  { name: 'Plaster of Paris', f: 'CaSO₄·½H₂O', emoji: '🦴', how: 'Heating gypsum (CaSO₄·2H₂O) at 373 K.', use: 'Plaster casts for broken bones, statues, smooth walls; sets hard when water is added.' },
  { name: 'Common salt', f: 'NaCl', emoji: '🧂', how: 'Evaporating seawater; rock salt.', use: 'Food; raw material for NaOH, Cl₂ and H₂ in the chlor-alkali process.' },
]

export default function SaltFactory() {
  const [ai, setAi] = useState(0)
  const [bi, setBi] = useState(0)
  const [crystals, setCrystals] = useState(5)
  const acid = ACIDS[ai]
  const base = BASES[bi]
  const cat = CATIONS.find((c) => c.name === base.cation)!
  const an = ANIONS.find((a) => a.name === acid.anion)!
  const salt = ionicFormula(cat, an).formula
  const pH = acid.strong === base.strong ? 7 : acid.strong ? 5 : 9
  // copper sulfate crystals: CuSO4·5H2O (249.5) lose 5H2O (90) when heated
  const water = (crystals * 90) / 249.5
  return (
    <LabFrame labId="salt-factory" title="Salt Factory" subtitle="Acid + base → salt + water. The salt's name comes from the metal in the base and the acid it came from." howTo={<p>Choose an acid and a base to make a salt. See whether its solution is neutral, acidic or basic. Then heat blue copper sulfate crystals to drive off their water of crystallisation.</p>}>
      <div className="grid gap-3 md:grid-cols-2">
        <div><p className="text-xs font-semibold text-muted-foreground uppercase">Acid</p><div className="mt-1 flex flex-wrap gap-1">{ACIDS.map((a, i) => <button key={a.name} type="button" aria-pressed={ai === i} onClick={() => setAi(i)} className={cn('rounded-lg border-2 px-2 py-1 text-xs', ai === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{a.formula} {a.strong ? '(strong)' : '(weak)'}</button>)}</div></div>
        <div><p className="text-xs font-semibold text-muted-foreground uppercase">Base</p><div className="mt-1 flex flex-wrap gap-1">{BASES.map((b, i) => <button key={b.name} type="button" aria-pressed={bi === i} onClick={() => setBi(i)} className={cn('rounded-lg border-2 px-2 py-1 text-xs', bi === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{b.formula} {b.strong ? '(strong)' : '(weak)'}</button>)}</div></div>
      </div>
      <p className="mt-3 rounded-2xl border p-3 font-mono">{acid.formula} + {base.formula} → <b className="text-chem">{pretty(salt)}</b> + H₂O</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <Readout label="Salt" value={`${base.cation.replace('(II)', '')} ${acid.anion.toLowerCase()}`} />
        <Readout label="Formula unit mass" value={`${molarMass(salt)} u`} />
        <Readout label="Salt solution pH" value={pH === 7 ? '≈ 7 (neutral)' : pH < 7 ? '< 7 (acidic)' : '> 7 (basic)'} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Strong acid + strong base → neutral salt; strong acid + weak base → acidic; weak acid + strong base → basic (like sodium carbonate).</p>
      <div className="mt-4 grid gap-4 rounded-2xl border p-3 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="font-semibold">💎 Water of crystallisation</p>
          <label className="mt-2 block text-sm">Blue copper sulfate crystals <b>{crystals} g</b><Slider value={[crystals]} min={1} max={25} step={1} onValueChange={([v]) => setCrystals(v)} className="mt-1" aria-label="mass of crystals" /></label>
          <p className="mt-2 font-mono text-sm">CuSO₄·5H₂O (blue) → CuSO₄ (white) + 5H₂O</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2"><Readout label="Water driven off" value={`${water.toFixed(2)} g`} /><Readout label="White powder left" value={`${(crystals - water).toFixed(2)} g`} /></div>
          <p className="mt-1 text-xs text-muted-foreground">Add a few drops of water and the white powder turns blue again, getting warm.</p>
        </div>
        <div className="flex items-center justify-center gap-4 text-6xl" aria-hidden><span>💙</span><span className="text-2xl">🔥→</span><span className="grayscale">🤍</span></div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{FAMOUS.map((f) => <div key={f.name} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{f.emoji} {f.name} <span className="font-mono text-xs text-muted-foreground">{f.f}</span></p><p className="mt-1 text-xs"><b>Made by:</b> {f.how}</p><p className="text-xs"><b>Uses:</b> {f.use}</p></div>)}</div>
    </LabFrame>
  )
}
