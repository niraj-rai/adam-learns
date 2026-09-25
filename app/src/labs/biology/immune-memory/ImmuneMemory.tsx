import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { antibodies, PROTECTIVE } from './model'

export default function ImmuneMemory() {
  const [vaccinated, setVaccinated] = useState(false)
  const data = useMemo(() => Array.from({ length: 31 }, (_, d) => ({ day: d, first: antibodies(d, false), second: antibodies(d, true) })), [])
  return (
    <LabFrame labId="immune-memory" title="Immune Memory" subtitle="Why do you get chickenpox only once? And how do vaccines protect you?" howTo={<p>Compare the antibody response the first time the body meets a germ and the second time. Then decide whether to vaccinate: a vaccine is a safe “first meeting”.</p>}>
      <div className="h-72 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'days after meeting the germ', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={36} label={{ value: 'antibodies', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={PROTECTIVE} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'enough to stop the germ', fontSize: 10, position: 'insideTopRight' }} />
            <Line dataKey="first" name="First meeting (or the vaccine)" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line dataKey="second" name="Second meeting (memory cells ready)" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className={cn('rounded-xl border p-3 text-sm', !vaccinated && 'border-destructive/50')}>
          <p className="font-semibold">Scenario: measles arrives in your town.</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant={vaccinated ? 'outline' : 'default'} onClick={() => setVaccinated(false)}>😬 Not vaccinated</Button>
            <Button size="sm" variant={vaccinated ? 'default' : 'outline'} onClick={() => setVaccinated(true)}>💉 Vaccinated as a baby</Button>
          </div>
          <p role="status" className="mt-2">{vaccinated ? '✅ Your memory cells recognise the virus at once. Antibodies shoot up within days (blue line) and the virus is destroyed before you even feel ill.' : '🤒 Your body has never met this virus. The first response is slow and weak (orange line), so the virus multiplies and you become ill for a week or more.'}</p>
        </div>
        <p className="rounded-xl bg-chem-soft p-3 text-sm">The <b>immune system</b> makes <b>antibodies</b> that lock onto a specific germ. After the first meeting, <b>memory cells</b> stay in the body for years. Next time, the response is much faster and bigger. A <b>vaccine</b> contains a weakened, killed or harmless part of a germ, which gives you that first meeting safely. Edward Jenner made the first vaccine, against smallpox, in 1796.</p>
      </div>
    </LabFrame>
  )
}
