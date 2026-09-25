import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { type Flags, type Pops, yearStep } from './model'

export default function PredatorPrey() {
  const [tigers, setTigers] = useState(6)
  const [deer, setDeer] = useState(150)
  const [f, setF] = useState<Flags>({ patrol: true, corridor: false })
  const data = useMemo(() => {
    let p: Pops = { grass: 600, deer, tigers }
    const out = [{ year: 0, grass: Math.round(p.grass), deer: Math.round(p.deer), tigers10: Math.round(p.tigers * 10) }]
    for (let y = 1; y <= 30; y++) {
      p = yearStep(p, f)
      out.push({ year: y, grass: Math.round(p.grass), deer: Math.round(p.deer), tigers10: Math.round(p.tigers * 10) })
    }
    return out
  }, [tigers, deer, f])
  const last = data[data.length - 1]
  return (
    <LabFrame labId="predator-prey" title="Predator and Prey" subtitle="Tigers, deer and grass keep each other in balance. What happens when one of them changes?" howTo={<p>Set the starting numbers and whether poaching is stopped. Watch 30 years unfold. What happens with no tigers? With lots of tigers? When poachers are active?</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="h-72 rounded-2xl border bg-background p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'years', position: 'insideBottom', offset: -8, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="grass" name="Grass (units)" stroke="#16a34a" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="deer" name="Deer" stroke="#b45309" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="tigers10" name="Tigers × 10" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">Starting tigers: <b>{tigers}</b>
            <Slider value={[tigers]} min={0} max={15} step={1} onValueChange={([v]) => setTigers(v)} className="mt-1.5" aria-label="Starting tigers" />
          </label>
          <label className="block text-sm">Starting deer: <b>{deer}</b>
            <Slider value={[deer]} min={20} max={400} step={10} onValueChange={([v]) => setDeer(v)} className="mt-1.5" aria-label="Starting deer" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={f.patrol ? 'default' : 'outline'} onClick={() => setF((x) => ({ ...x, patrol: !x.patrol }))}>{f.patrol ? '🛡️ Anti-poaching on' : '⚠️ Poachers active'}</Button>
            <Button size="sm" variant={f.corridor ? 'default' : 'outline'} onClick={() => setF((x) => ({ ...x, corridor: !x.corridor }))}>🌉 {f.corridor ? 'Corridor open' : 'No corridor'}</Button>
          </div>
          <Readout label="After 30 years" value={`${last.grass} grass · ${last.deer} deer · ${(last.tigers10 / 10).toFixed(1)} tigers`} />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Without tigers, deer multiply, overgraze the grass and then starve: a boom and a crash. With tigers, deer numbers are held in check and the grass stays healthy. A top predator like the tiger keeps the whole ecosystem in balance. This is one reason India launched <b>Project Tiger</b> in 1973. (A simplified model.)</p>
    </LabFrame>
  )
}
