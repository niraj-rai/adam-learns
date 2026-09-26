import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { organicName, type Group } from '../_shared/organic'

const GROUPS: { g: Group; label: string; formula: string; suffix: string; example: string }[] = [
  { g: 'alcohol', label: 'Alcohol', formula: '–OH', suffix: '-ol', example: 'Ethanol is in hand sanitisers and is the alcohol in drinks; also a fuel mixed into petrol in India.' },
  { g: 'aldehyde', label: 'Aldehyde', formula: '–CHO', suffix: '-al', example: 'Methanal (formaldehyde) preserves biological specimens.' },
  { g: 'ketone', label: 'Ketone', formula: '>C=O', suffix: '-one', example: 'Propanone (acetone) is nail-polish remover.' },
  { g: 'acid', label: 'Carboxylic acid', formula: '–COOH', suffix: '-oic acid', example: 'Ethanoic acid (acetic acid): 5–8% in water is vinegar.' },
  { g: 'chloro', label: 'Halo (chloro)', formula: '–Cl', suffix: 'chloro-', example: 'Chloromethane was used as a refrigerant.' },
]
const REACTIONS = [
  { name: 'Combustion', eq: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O + heat', note: 'Ethanol burns with a clean blue flame.' },
  { name: 'Oxidation', eq: 'C₂H₅OH → CH₃COOH (with alkaline KMnO₄ or K₂Cr₂O₇)', note: 'Alcohols are oxidised to carboxylic acids: why wine can turn to vinegar.' },
  { name: 'Esterification', eq: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O (acid catalyst)', note: 'Esters smell fruity and are used in perfumes and flavourings.' },
  { name: 'With sodium', eq: '2Na + 2C₂H₅OH → 2C₂H₅ONa + H₂', note: 'Hydrogen gas is given off.' },
  { name: 'Acid + carbonate', eq: '2CH₃COOH + Na₂CO₃ → 2CH₃COONa + H₂O + CO₂', note: 'Fizzing: a test for carboxylic acids.' },
]

export default function FunctionalGroups() {
  const [n, setN] = useState(2)
  const [g, setG] = useState<Group>('alcohol')
  const name = organicName(n, g)
  const info = GROUPS.find((x) => x.g === g)!
  return (
    <LabFrame labId="functional-groups" title="Functional Groups" subtitle="Swap one hydrogen for a functional group and a hydrocarbon gets a whole new set of properties, and a new name." howTo={<p>Choose the chain length and a functional group to see the name. Then explore the reactions of ethanol and ethanoic acid.</p>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Carbon atoms <b>{n}</b><Slider value={[n]} min={1} max={6} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="carbon atoms" /></label>
        <div className="flex flex-wrap gap-1">{GROUPS.map((x) => <button key={x.g} type="button" aria-pressed={g === x.g} onClick={() => setG(x.g)} className={cn('rounded-lg border-2 px-2 py-1 text-xs', g === x.g ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.label} <span className="font-mono">{x.formula}</span></button>)}</div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Name" value={name ?? 'Not possible'} />
        <Readout label="Group" value={<span className="font-mono">{info.formula}</span>} />
        <Readout label="Name ending" value={info.suffix} />
      </div>
      {!name && <p className="mt-2 text-sm text-muted-foreground">A ketone needs at least 3 carbons, because the C=O must be in the middle of the chain.</p>}
      <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">{info.example}</p>
      <div className="mt-4 space-y-2">
        <p className="font-semibold">⚗️ Ethanol and ethanoic acid</p>
        {REACTIONS.map((r) => <div key={r.name} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{r.name}</p><p className="font-mono text-xs">{r.eq}</p><p className="text-xs text-muted-foreground">{r.note}</p></div>)}
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Naming: the <b>stem</b> tells you the number of carbons (meth-1, eth-2, prop-3, but-4, pent-5, hex-6) and the <b>ending</b> tells you the functional group. Compounds with the same group behave alike, whatever the chain length.</p>
    </LabFrame>
  )
}
