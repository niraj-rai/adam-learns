import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { evaluate, meets, TARGET, type Use, USES } from './model'

const START: Use[] = Array(16).fill('forest')

export default function ConservationPlanner() {
  const addXp = useProgress((s) => s.addXp)
  const [grid, setGrid] = useState<Use[]>(START)
  const [brush, setBrush] = useState<Use>('farm')
  const [rewarded, setRewarded] = useState(false)
  const e = evaluate(grid)
  const ok = meets(grid)
  const paint = (i: number) => {
    const next = grid.map((u, j) => (j === i ? brush : u))
    setGrid(next)
    if (!rewarded && meets(next)) { setRewarded(true); sfx.win(); addXp(10, 'Balanced land plan') }
  }
  return (
    <LabFrame labId="conservation-planner" title="Conservation Planner" subtitle="People need farms, towns and jobs; wildlife needs connected forests. Can you plan a district that works for both?" howTo={<p>Choose a land use, then tap squares on the map to paint it. Aim for biodiversity of at least {TARGET.bio} AND income of at least {TARGET.income}. Tip: forest squares next to other forest or corridors are worth more, and mines harm the forest next to them.</p>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(Object.keys(USES) as Use[]).map((u) => <Button key={u} size="sm" variant={brush === u ? 'default' : 'outline'} onClick={() => setBrush(u)}>{USES[u].emoji} {USES[u].name}</Button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="grid grid-cols-4 gap-1 rounded-2xl border bg-background p-2" role="grid" aria-label="District map">
          {grid.map((u, i) => (
            <button key={i} type="button" onClick={() => paint(i)} aria-label={`Square ${i + 1}: ${USES[u].name}`} className="grid aspect-square place-items-center rounded-md text-2xl" style={{ background: `${USES[u].colour}33`, border: `2px solid ${USES[u].colour}` }}>{USES[u].emoji}</button>
          ))}
        </div>
        <div className="space-y-2">
          <Readout label="Biodiversity" value={`${e.bio} / ${TARGET.bio} needed`} className={cn(e.bio >= TARGET.bio ? 'text-success' : 'text-destructive')} />
          <Readout label="Income for people" value={`${e.income} / ${TARGET.income} needed`} className={cn(e.income >= TARGET.income ? 'text-success' : 'text-destructive')} />
          <Button size="sm" variant="ghost" onClick={() => setGrid(START)}>↺ Reset to all forest</Button>
          <p role="status" className={cn('rounded-lg p-3 text-sm', ok ? 'bg-success-soft' : 'bg-chem-soft')}>{ok ? '✅ A balanced plan! Keeping forests in large connected blocks, joined by corridors, protects wildlife while leaving room for farms and towns.' : 'Not balanced yet. Keep large blocks of forest together, and put mines away from forests.'}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">India protects wildlife in <b>national parks</b>, <b>wildlife sanctuaries</b> and <b>biosphere reserves</b>. The Nilgiri Biosphere Reserve (1986) was the first, spanning Karnataka, Kerala and Tamil Nadu. <b>Wildlife corridors</b> connect protected areas so animals like elephants and tigers can move between them. (Scores are a simplified model.)</p>
    </LabFrame>
  )
}
