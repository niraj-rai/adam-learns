import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { MILESTONES, milestoneAt } from './model'

const ORGANS = [
  { part: 'Ovaries', job: 'Make eggs (female gametes) and the hormones oestrogen and progesterone.' },
  { part: 'Oviducts (fallopian tubes)', job: 'Carry the egg towards the uterus; fertilisation happens here.' },
  { part: 'Uterus', job: 'A muscular organ where the embryo implants and the baby grows.' },
  { part: 'Testes', job: 'Make sperm (male gametes) and the hormone testosterone.' },
  { part: 'Sperm ducts and glands', job: 'Carry sperm and add fluid that nourishes them (together called semen).' },
]

export default function PregnancyTimeline() {
  const [week, setWeek] = useState(2)
  const m = milestoneAt(week)
  const grow = Math.max(0.08, Math.min(1, week / 40))
  return (
    <LabFrame labId="pregnancy-timeline" title="How a Baby Develops" subtitle="From a single fertilised cell to a newborn baby in about 40 weeks." howTo={<p>Move the slider through the weeks of pregnancy to see the main milestones. Below, review the reproductive organs and what they do.</p>}>
      <label className="block text-sm">Week of pregnancy <b>{week}</b><Slider value={[week]} min={2} max={40} step={1} onValueChange={([v]) => setWeek(v)} className="mt-1" aria-label="week of pregnancy" /></label>
      <div className="mt-3 flex flex-wrap gap-1">{MILESTONES.map((x) => <button key={x.week} type="button" onClick={() => setWeek(x.week)} className={cn('rounded-full border px-2 py-0.5 text-xs', m.week === x.week ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>Wk {x.week}: {x.title}</button>)}</div>
      <div className="mt-3 grid items-center gap-4 md:grid-cols-[200px_1fr]">
        <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[200px]" role="img" aria-label={`Week ${week}: ${m.title}`}>
          <circle cx={100} cy={100} r={92} fill="#fce7f3" stroke="#db2777" strokeWidth={3} />
          <circle cx={100} cy={100} r={20 + 60 * grow} fill="#e0f2fe" opacity={0.8} />
          {week < 5 ? <circle cx={100} cy={100} r={4 + week * 2} fill="#f9a8d4" stroke="#be185d" /> : <text x={100} y={100 + 30 * grow} textAnchor="middle" fontSize={20 + 80 * grow}>👶</text>}
        </svg>
        <div className="rounded-2xl border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Around week {m.week}</p>
          <p className="font-heading text-2xl font-semibold">{m.title}</p>
          <p className="mt-1">{m.text}</p>
          <p className="mt-2 text-sm text-muted-foreground">📏 Size: {m.size}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">Reproductive organs and their jobs</p>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">{ORGANS.map((o) => <li key={o.part} className="rounded-xl bg-muted/50 px-3 py-2"><b>{o.part}:</b> {o.job}</li>)}</ul>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A healthy pregnancy depends on good nutrition, regular check-ups and avoiding smoking and alcohol, because substances in the mother’s blood can cross the placenta. If you have questions about growing up or reproduction, a parent, school nurse or teacher is a good person to ask.</p>
    </LabFrame>
  )
}
