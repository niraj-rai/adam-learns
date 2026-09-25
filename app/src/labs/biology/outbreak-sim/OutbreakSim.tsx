import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { DISEASES_R0, herdThreshold, sir } from './model'

export default function OutbreakSim() {
  const [did, setDid] = useState('measles')
  const [vacc, setVacc] = useState(50)
  const d = DISEASES_R0.find((x) => x.id === did)!
  const res = useMemo(() => sir(d.r0, vacc / 100), [d.r0, vacc])
  const thr = herdThreshold(d.r0)
  const safe = vacc / 100 >= thr
  return (
    <LabFrame labId="outbreak-sim" title="Outbreak Simulator" subtitle="How many people must be vaccinated to protect a whole town of 10,000? It depends on the disease." howTo={<p>Choose a disease and set the percentage of people vaccinated. Watch the outbreak curve. Find the herd-immunity level where the outbreak fizzles out.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {DISEASES_R0.map((x) => <button key={x.id} type="button" onClick={() => setDid(x.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === did ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name} (R₀ ≈ {x.r0})</button>)}
      </div>
      <label className="block text-sm">Vaccinated: <b>{vacc}%</b>
        <Slider value={[vacc]} min={0} max={99} step={1} onValueChange={([v]) => setVacc(v)} className="mt-1.5" aria-label="Percentage vaccinated" />
      </label>
      <div className="mt-3 h-64 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={res.series} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'days', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} width={44} domain={[0, 10000]} />
            <Tooltip />
            <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            <Area dataKey="R" name="Immune (vaccinated or recovered)" stackId="1" stroke="#16a34a" fill="#bbf7d0" isAnimationActive={false} />
            <Area dataKey="I" name="Ill" stackId="1" stroke="#dc2626" fill="#fca5a5" isAnimationActive={false} />
            <Area dataKey="S" name="Could still catch it" stackId="1" stroke="#64748b" fill="#e2e8f0" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Readout label="People who caught it" value={res.everInfected.toLocaleString('en-IN')} />
        <Readout label="Most ill at once" value={res.peak.toLocaleString('en-IN')} />
        <Readout label="Herd-immunity level (1 − 1/R₀)" value={`${Math.round(thr * 100)}%`} />
        <Readout label="Town protected?" value={safe ? '✅ yes' : '❌ not yet'} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>R₀</b> is how many people one ill person infects in a population where no one is immune. When enough people are immune, the germ can't find new people to infect, which protects even those who can't be vaccinated, like newborn babies. This is <b>herd immunity</b>. Measles spreads so easily that about 95% of people need to be vaccinated. India's Universal Immunisation Programme vaccinates millions of babies every year. (A simplified model.)</p>
    </LabFrame>
  )
}
