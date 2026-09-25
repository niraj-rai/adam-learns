import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { type Action, applyAction, type Flags, healthy, type Pops, START } from '../predator-prey/model'

const ACTIONS: { id: Action; name: string; emoji: string; note: string }[] = [
  { id: 'patrol', name: 'Anti-poaching patrols', emoji: '🛡️', note: 'Stops poachers killing tigers (lasts for good)' },
  { id: 'corridor', name: 'Open a wildlife corridor', emoji: '🌉', note: 'About one new tiger arrives each year (lasts for good)' },
  { id: 'relocate', name: 'Relocate some deer', emoji: '🚚', note: 'Moves 30% of deer to another reserve (this year only)' },
  { id: 'plant', name: 'Plant native grass', emoji: '🌱', note: 'Adds grass (this year only)' },
  { id: 'none', name: 'Watch and wait', emoji: '👀', note: 'Let nature take its course this year' },
]

export default function ForestKeeper() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [history, setHistory] = useState<Pops[]>([START])
  const [flags, setFlags] = useState<Flags>({ patrol: false, corridor: false })
  const [log, setLog] = useState<string[]>([])
  const year = history.length - 1
  const pops = history[history.length - 1]
  const over = year >= 10
  const won = over && healthy(pops)

  const act = (a: Action) => {
    const r = applyAction(pops, flags, a)
    const h = [...history, r.pops]
    setHistory(h)
    setFlags(r.flags)
    setLog((l) => [...l, `Year ${year + 1}: ${ACTIONS.find((x) => x.id === a)!.name}`])
    if (h.length - 1 >= 10) {
      if (healthy(r.pops)) {
        sfx.win()
        if (!useProgress.getState().badges.includes('forest-keeper')) addXp(40, 'Forest Keeper!')
        awardBadge('forest-keeper')
      } else sfx.wrong()
    } else sfx.click()
  }
  const restart = () => { setHistory([START]); setFlags({ patrol: false, corridor: false }); setLog([]) }
  const data = history.map((p, i) => ({ year: i, grass: Math.round(p.grass), deer: Math.round(p.deer), tigers10: Math.round(p.tigers * 10) }))

  return (
    <LabFrame labId="forest-keeper" title="Boss Challenge: Forest Keeper" subtitle="You're the new manager of a tiger reserve. Poachers have killed most of the tigers and deer are overrunning the grasslands. Restore balance in 10 years." howTo={<p>Each year, choose ONE action. After 10 years the reserve is healthy if there are 400–800 units of grass, 80–250 deer and at least 4 tigers. Think about the whole food chain!</p>}>
      {won && <Confetti count={90} />}
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="h-64 rounded-2xl border bg-background p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11 }} label={{ value: 'year', position: 'insideBottom', offset: -8, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} domain={[0, 1000]} />
              <ReferenceArea y1={400} y2={800} fill="#16a34a" fillOpacity={0.06} />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="grass" name="Grass" stroke="#16a34a" strokeWidth={2} isAnimationActive={false} />
              <Line dataKey="deer" name="Deer" stroke="#b45309" strokeWidth={2} isAnimationActive={false} />
              <Line dataKey="tigers10" name="Tigers × 10" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 3" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          <Readout label={`Year ${year} of 10`} value={`${Math.round(pops.grass)} grass · ${Math.round(pops.deer)} deer · ${pops.tigers.toFixed(1)} tigers`} />
          <div className="flex flex-wrap gap-1 text-xs">
            {flags.patrol && <span className="rounded-full bg-success-soft px-2 py-0.5">🛡️ patrols active</span>}
            {flags.corridor && <span className="rounded-full bg-success-soft px-2 py-0.5">🌉 corridor open</span>}
          </div>
          <ol className="max-h-32 overflow-auto text-xs text-muted-foreground">{log.map((l) => <li key={l}>{l}</li>)}</ol>
        </div>
      </div>
      {!over ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIONS.map((a) => {
            const active = (a.id === 'patrol' && flags.patrol) || (a.id === 'corridor' && flags.corridor)
            return (
              <button key={a.id} type="button" disabled={active} onClick={() => act(a.id)} className={cn('rounded-xl border px-3 py-2 text-left text-sm hover:border-chem disabled:opacity-50')}>
                <span className="text-xl">{a.emoji}</span> <b>{a.name}</b><span className="block text-xs text-muted-foreground">{active ? 'Already in place' : a.note}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div role="status" className={cn('mt-3 rounded-2xl p-4 text-sm', won ? 'bg-success-soft' : 'bg-warn-soft')}>
          {won ? '🏆 The reserve is thriving! Protecting the top predator brought the deer back under control, which let the grassland recover. You are a Forest Keeper.' : `The reserve isn't balanced yet (${Math.round(pops.grass)} grass, ${Math.round(pops.deer)} deer, ${pops.tigers.toFixed(1)} tigers). Hint: without tigers, deer overgraze. Protect tigers early, and reduce deer while tiger numbers recover.`}
          <Button className="ml-2 mt-2" variant="outline" onClick={restart}>↺ Try again</Button>
        </div>
      )}
    </LabFrame>
  )
}
