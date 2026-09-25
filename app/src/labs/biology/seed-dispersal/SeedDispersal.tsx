import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { distance, type Feature, FEATURES, PLACES } from './model'

export default function SeedDispersal() {
  const addXp = useProgress((s) => s.addXp)
  const [place, setPlace] = useState('hill')
  const [f, setF] = useState<Feature>('plain')
  const [launched, setLaunched] = useState(0)
  const [solved, setSolved] = useState<string[]>([])
  const d = distance(f, place)
  const P = PLACES.find((x) => x.id === place)!
  const good = P.best.includes(f)
  const launch = () => {
    setLaunched((n) => n + 1)
    if (good) { sfx.correct(); if (!solved.includes(place)) { setSolved((s) => [...s, place]); addXp(5, `Seed spread: ${P.name}`) } } else sfx.click()
  }
  const px = Math.min(300, 40 + Math.log10(d + 1) * 90)
  return (
    <LabFrame labId="seed-dispersal" title="Seed Designer" subtitle="Seeds that land right under the parent must compete with it. Design seeds that travel!" howTo={<p>Choose a place, then give your seed a feature and launch it. Find the best feature for each place.</p>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PLACES.map((x) => <button key={x.id} type="button" onClick={() => { setPlace(x.id); setLaunched(0) }} className={cn('rounded-full border px-3 py-1 text-sm', x.id === place ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{solved.includes(x.id) ? '✅' : x.emoji} {x.name}</button>)}
      </div>
      <svg viewBox="0 0 340 120" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={`Seed travelled about ${d} metres`}>
        <rect y={100} width={340} height={20} fill={place === 'river' ? '#38bdf8' : '#86efac'} />
        <text x={30} y={98} fontSize={34}>🌳</text>
        {launched > 0 && <motion.text key={launched} initial={{ x: 50, y: 60 }} animate={{ x: px, y: 98 }} transition={{ duration: 1.4, ease: 'easeOut' }} fontSize={18}>{FEATURES[f].emoji}</motion.text>}
        <text x={320} y={20} fontSize={10} textAnchor="end" className="fill-muted-foreground">(distance on a log scale)</text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(Object.keys(FEATURES) as Feature[]).map((k) => <Button key={k} size="sm" variant={f === k ? 'default' : 'outline'} onClick={() => setF(k)}>{FEATURES[k].emoji} {FEATURES[k].name}</Button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={launch}>🚀 Release the seed</Button>
        {launched > 0 && <Readout label="Distance from parent" value={`about ${d} m`} />}
      </div>
      {launched > 0 && <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', good ? 'bg-success-soft' : 'bg-warn-soft')}>{good ? `✅ Great choice for a ${P.name.toLowerCase()}! Real examples: ${FEATURES[f].example}.` : `This seed didn't get far here. Think about what moves around in a ${P.name.toLowerCase()}: wind, water or animals?`}</p>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Seed dispersal</b> spreads seeds away from the parent, so seedlings don't compete with it for light, water and nutrients, and the plant can colonise new places. Seeds travel by <b>wind</b>, <b>water</b>, <b>animals</b> or by <b>exploding</b> pods.</p>
    </LabFrame>
  )
}
