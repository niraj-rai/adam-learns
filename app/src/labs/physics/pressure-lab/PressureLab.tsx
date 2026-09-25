import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** Contact area in cm² for a 450 N (≈ 45 kg) person. */
export const STANCES = [
  { id: 'two', name: 'Standing on two feet', emoji: '🧍', area: 300 },
  { id: 'one', name: 'Standing on one foot', emoji: '🦩', area: 150 },
  { id: 'heels', name: 'On one stiletto heel', emoji: '👠', area: 1 },
  { id: 'lying', name: 'Lying down flat', emoji: '🛌', area: 3000 },
  { id: 'snowshoes', name: 'Wearing snowshoes', emoji: '🎿', area: 2500 },
]
const FORCE = 450

export function pressureNcm2(force: number, areaCm2: number) {
  return force / areaCm2
}

export default function PressureLab() {
  const [sid, setSid] = useState('two')
  const [nails, setNails] = useState(1000)
  const s = STANCES.find((x) => x.id === sid)!
  const p = pressureNcm2(FORCE, s.area)
  const sink = Math.min(60, Math.sqrt(p) * 6)
  const perNail = FORCE / nails

  return (
    <LabFrame labId="pressure-lab" title="Pressure Lab" subtitle="Same force, different area. Why do some people sink into snow and others don't?" howTo={<p>A person weighing 450 N stands on soft snow in different ways. Watch how deep they sink. Then try the bed of nails!</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {STANCES.map((x) => (
          <button key={x.id} type="button" onClick={() => setSid(x.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === sid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <svg viewBox="0 0 300 170" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={`${s.name}: pressure ${p.toFixed(1)} newtons per square centimetre, sinking ${sink.toFixed(0)} units`}>
          <rect x={0} y={100} width={300} height={70} fill="#f8fafc" stroke="#cbd5e1" />
          <motion.text x={150} textAnchor="middle" fontSize={48} animate={{ y: 96 + sink }} transition={{ type: 'spring', stiffness: 80 }}>{s.emoji}</motion.text>
          <rect x={0} y={100} width={300} height={4} fill="#e2e8f0" opacity={0.8} />
          <text x={8} y={160} fontSize={10} className="fill-muted-foreground">soft snow</text>
        </svg>
        <div className="space-y-2">
          <Readout label="Force (weight)" value={`${FORCE} N`} />
          <Readout label="Area in contact" value={`${s.area} cm²`} />
          <Readout label="Pressure = force ÷ area" value={`${p < 1 ? p.toFixed(2) : p.toFixed(1)} N/cm²`} />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm" role="status">
        {p > 100 ? '👠 Huge pressure! All the force is squeezed onto a tiny area, so the heel sinks right in.' : p < 0.3 ? '🎿 Tiny pressure! The force is spread over a large area, so you barely sink. That\'s why snowshoes and camel feet are wide.' : 'The smaller the area, the bigger the pressure, and the deeper you sink.'}
      </p>

      <div className="mt-5 rounded-2xl border p-4">
        <p className="font-heading font-semibold">🛏️ The bed of nails</p>
        <p className="text-sm text-muted-foreground">How many nails does it take to lie safely on a bed of nails? (About 10 N on one nail point is enough to hurt.)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 10, 100, 1000].map((n) => (
            <button key={n} type="button" onClick={() => setNails(n)} className={cn('rounded-full border px-3 py-1 text-sm', nails === n ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{n} nail{n > 1 ? 's' : ''}</button>
          ))}
        </div>
        <p className="mt-2 text-sm" role="status">
          Force on each nail = {FORCE} ÷ {nails} = <b>{perNail.toFixed(perNail < 1 ? 2 : 0)} N</b>. {perNail > 10 ? '😣 Ouch! Too much force on each point.' : '😌 Comfortable enough: the force is shared by many nails.'}
        </p>
      </div>
    </LabFrame>
  )
}
