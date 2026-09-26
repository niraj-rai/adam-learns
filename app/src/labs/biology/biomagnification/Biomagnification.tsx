import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const CHAIN = [
  { name: 'Lake water', emoji: '💧', energy: 0 },
  { name: 'Plankton (producers)', emoji: '🦠', energy: 10000 },
  { name: 'Small fish', emoji: '🐟', energy: 1000 },
  { name: 'Big fish', emoji: '🐠', energy: 100 },
  { name: 'Fish-eating bird', emoji: '🦅', energy: 10 },
]
const FACTOR = 10 // concentration multiplies about ten times at each level
const HARMFUL = 5 // ppm

export default function Biomagnification() {
  const [ppm, setPpm] = useState(0.02)
  const conc = CHAIN.map((_, k) => ppm * FACTOR ** k)
  return (
    <LabFrame labId="biomagnification" title="Up the Food Chain" subtitle="Energy shrinks at each step of a food chain, but some poisons build up. This is biological magnification." howTo={<p>Change how much pesticide washes into the lake. Watch the energy fall and the pesticide concentration rise at each level.</p>}>
      <label className="block text-sm">Pesticide in the lake water <b>{ppm.toFixed(3)} ppm</b><Slider value={[ppm]} min={0.001} max={0.05} step={0.001} onValueChange={([v]) => setPpm(v)} className="mt-1" aria-label="pesticide concentration" /></label>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {CHAIN.map((c, k) => (
          <div key={c.name} className={`rounded-2xl border-2 p-3 text-center ${conc[k] > HARMFUL ? 'border-destructive bg-destructive/10' : ''}`}>
            <p className="text-3xl">{c.emoji}</p>
            <p className="text-xs font-semibold">{c.name}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{c.energy ? `Energy: ${c.energy.toLocaleString("en-IN")} kJ` : "Not a trophic level"}</p>
            <p className="text-[11px] font-mono">Pesticide: {conc[k] < 0.1 ? conc[k].toFixed(3) : conc[k].toFixed(1)} ppm</p>
            {k < CHAIN.length - 1 && <p className="mt-1 text-lg sm:hidden">⬇️</p>}
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Energy passed on each step" value="≈ 10% (10% law)" />
        <Readout label="Pesticide in the bird" value={`${conc[4].toFixed(1)} ppm`} />
        <Readout label="Times the lake level" value={`${(FACTOR ** 4).toLocaleString('en-IN')}×`} />
      </div>
      {conc[4] > HARMFUL && <p className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-sm">⚠️ At this level the top predator is harmed: DDT famously made birds’ eggshells so thin they broke. Humans at the top of food chains are exposed too.</p>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Only about <b>10%</b> of the energy at one level reaches the next; the rest is used for life processes and lost as heat. So food chains are short. But <b>non-biodegradable</b> chemicals like some pesticides are not broken down or excreted: they build up in body fat, and each animal eats many from the level below. This <b>biological magnification</b> makes the top of the chain the most contaminated.</p>
    </LabFrame>
  )
}
