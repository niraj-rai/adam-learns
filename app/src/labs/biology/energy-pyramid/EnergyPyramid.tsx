import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { energyAt, LEVELS } from './model'

export default function EnergyPyramid() {
  const [t, setT] = useState(10)
  return (
    <LabFrame labId="energy-pyramid" title="Energy Pyramid" subtitle="Only a small part of the energy at each level passes to the next. Why are there so few tigers?" howTo={<p>Sunlight gives 1,000,000 kJ of energy to a grassland. Plants capture about 1%. Change how much energy passes up each level and watch the pyramid.</p>}>
      <div className="flex flex-col items-center gap-1 rounded-2xl border bg-background p-4">
        {[...LEVELS].reverse().map((l, ri) => {
          const i = LEVELS.length - 1 - ri
          const e = energyAt(i, 1_000_000, t / 100)
          const w = Math.max(6, Math.min(100, (Math.log10(e + 1) / 4) * 100))
          return (
            <div key={l.id} className="flex w-full items-center gap-2">
              <span className="w-40 text-right text-xs">{l.emoji} {l.name}</span>
              <div className="flex-1"><div className="mx-auto h-7 rounded bg-lime-500/80 text-center text-xs leading-7 text-white" style={{ width: `${w}%` }}>{e >= 1 ? `${Math.round(e).toLocaleString('en-IN')} kJ` : `${e.toFixed(3)} kJ`}</div></div>
            </div>
          )
        })}
      </div>
      <label className="mt-3 block text-sm">Energy passed to the next level: <b>{t}%</b>
        <Slider value={[t]} min={5} max={20} step={1} onValueChange={([v]) => setT(v)} className="mt-1.5" aria-label="Transfer efficiency" />
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Readout label="Energy reaching eagles" value={`${energyAt(4, 1_000_000, t / 100).toFixed(2)} kJ`} />
        <Readout label="Share of the plants’ energy" value={`${((t / 100) ** 4 * 100).toPrecision(2)}%`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">At each level, most energy is used for living (respiration, movement, keeping warm) or lost as heat and waste. Only about <b>10%</b> is stored in the body and passes to the next eater. That's why food chains rarely have more than 4–5 links, and why there are far fewer tigers than deer, and far fewer deer than grass plants. (Widths are on a log scale.)</p>
    </LabFrame>
  )
}
