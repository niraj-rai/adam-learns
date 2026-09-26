import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { AVOGADRO, molarMass, pretty } from '../_shared/quantities'

const SUBSTANCES = [
  { name: 'Water', formula: 'H2O', emoji: '💧', unit: 'molecules' },
  { name: 'Carbon', formula: 'C', emoji: '✏️', unit: 'atoms' },
  { name: 'Salt', formula: 'NaCl', emoji: '🧂', unit: 'formula units' },
  { name: 'Sugar (sucrose)', formula: 'C12H22O11', emoji: '🍬', unit: 'molecules' },
  { name: 'Carbon dioxide', formula: 'CO2', emoji: '🫧', unit: 'molecules' },
  { name: 'Iron', formula: 'Fe', emoji: '🔩', unit: 'atoms' },
]

function sci(x: number) {
  if (x === 0) return '0'
  const e = Math.floor(Math.log10(x))
  const m = x / 10 ** e
  return `${m.toFixed(2)} × 10${String(e).replace(/-?\d/g, (d) => (d === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]))}`
}

export default function MoleBridge() {
  const [si, setSi] = useState(0)
  const [mass, setMass] = useState(18)
  const s = SUBSTANCES[si]
  const M = molarMass(s.formula)
  const n = mass / M
  const N = n * AVOGADRO
  return (
    <LabFrame labId="mole-bridge" title="The Mole Bridge" subtitle="The mole links the grams you can weigh to the number of particles you can't count." howTo={<p>Pick a substance and set the mass on the balance. Follow the bridge: grams → moles → particles.</p>}>
      <div className="flex flex-wrap gap-1">
        {SUBSTANCES.map((x, i) => <button key={x.formula} type="button" aria-pressed={si === i} onClick={() => { setSi(i); setMass(molarMass(x.formula)) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', si === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
      </div>
      <label className="mt-3 block text-sm">Mass on the balance <b>{mass} g</b><Slider value={[mass]} min={1} max={400} step={1} onValueChange={([v]) => setMass(v)} className="mt-1" aria-label="mass in grams" /></label>
      <div className="mt-4 grid items-stretch gap-2 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl border-2 p-3"><p className="text-3xl">⚖️</p><p className="text-xs text-muted-foreground uppercase">Mass</p><p className="font-heading text-2xl font-bold">{mass} g</p></div>
        <div className="grid place-items-center text-xs text-muted-foreground">÷ {M} g/mol<br />→</div>
        <div className="rounded-2xl border-2 border-chem bg-chem-soft p-3"><p className="text-3xl">🧺</p><p className="text-xs text-muted-foreground uppercase">Amount</p><p className="font-heading text-2xl font-bold">{n.toFixed(3)} mol</p></div>
        <div className="grid place-items-center text-xs text-muted-foreground">× 6.022 × 10²³<br />→</div>
        <div className="rounded-2xl border-2 p-3"><p className="text-3xl">🔬</p><p className="text-xs text-muted-foreground uppercase">Particles</p><p className="font-heading text-xl font-bold">{sci(N)}</p></div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label={`Molar mass of ${pretty(s.formula)}`} value={`${M} g/mol`} />
        <Readout label="n = m ÷ M" value={`${mass} ÷ ${M} = ${n.toFixed(3)} mol`} />
        <Readout label="N = n × Nᴀ" value={`${sci(N)} ${s.unit}`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>mole</b> is a counting unit, like a dozen (12) but enormous: <b>6.022 × 10²³</b> particles (the <b>Avogadro number</b>). One mole of any substance has a mass in grams equal to its atomic or molecular mass: 18 g of water, 12 g of carbon, 58.5 g of salt. If you counted one water molecule every second, a single mole would take you about 19 million billion years!</p>
    </LabFrame>
  )
}
