import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { averageInfected, type Measures, simulate, transmission } from './model'

const LABELS: Record<keyof Measures, string> = { handwashing: '🧼 Handwashing', masks: '😷 Masks when coughing', ventilation: '🪟 Open windows', stayHome: '🏠 Stay home when ill' }

export default function GermSpread() {
  const [m, setM] = useState<Measures>({ handwashing: false, masks: false, ventilation: false, stayHome: false })
  const [seed, setSeed] = useState(3)
  const [day, setDay] = useState(15)
  const run = useMemo(() => simulate(m, 15, seed * 97), [m, seed])
  const avg = useMemo(() => averageInfected(m), [m])
  const grid = run.history[day]
  return (
    <LabFrame labId="germ-spread" title="Germ Spread Classroom" subtitle="One pupil comes to school with flu. How far does it spread through a class of 30, and what slows it down?" howTo={<p>Switch measures on or off, then slide through the days. Each day, sick pupils can pass the germ to the classmates next to them. Try “new outbreak” a few times: chance plays a part, so compare the averages!</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(LABELS) as (keyof Measures)[]).map((k) => <Button key={k} size="sm" variant={m[k] ? 'default' : 'outline'} onClick={() => setM((x) => ({ ...x, [k]: !x[k] }))}>{LABELS[k]}</Button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="grid grid-cols-6 gap-2 rounded-2xl border bg-background p-4" aria-label={`Day ${day}: ${grid.filter((s) => s > 0).length} ill`}>
          {grid.map((s, i) => (
            <div key={i} className={cn('grid aspect-square place-items-center rounded-lg text-xl', s > 0 ? 'bg-red-200 dark:bg-red-900' : s < 0 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-lime-100 dark:bg-lime-900')}>
              {s > 0 ? (m.stayHome && s >= 2 ? '🏠' : '🤒') : s < 0 ? '🙂' : '🧒'}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <label className="block text-sm">Day: <b>{day}</b>
            <Slider value={[day]} min={0} max={15} step={1} onValueChange={([v]) => setDay(v)} className="mt-1.5" aria-label="Day" />
          </label>
          <Readout label="Chance per contact" value={`${Math.round(transmission(m) * 100)}%`} />
          <Readout label="Caught it (this outbreak)" value={`${run.everInfected} / 30`} />
          <Readout label="Average over 60 outbreaks" value={`${avg.toFixed(1)} / 30`} />
          <Button size="sm" variant="outline" onClick={() => setSeed((x) => x + 1)}>🎲 New outbreak</Button>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">🧒 healthy · 🤒 ill · 🏠 ill at home · 🙂 recovered. Each measure cuts the chance of passing germs on, and together they can stop an outbreak in its tracks. This is why schools promote handwashing and ask sick pupils to rest at home.</p>
    </LabFrame>
  )
}
