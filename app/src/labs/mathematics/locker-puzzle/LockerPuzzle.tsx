import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { factors } from '../_shared/number'
import { openLockers } from './model'

const N = 100

export default function LockerPuzzle() {
  const [people, setPeople] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const open = new Set(openLockers(N, people))
  const go = (k: number) => {
    const next = Math.min(N, k)
    setPeople(next)
    if (next === N) sfx.win()
    else sfx.click()
  }
  return (
    <LabFrame labId="locker-puzzle" title="The Locker Puzzle" subtitle="100 closed lockers, 100 people. Which lockers end up open?" howTo={<p>Person 1 opens every locker. Person 2 toggles (opens or closes) every 2nd locker, person 3 every 3rd, and so on up to person 100. Step through, then tap a locker to see who touched it.</p>}>
      <div className="grid grid-cols-10 gap-1" role="grid" aria-label="Lockers">
        {Array.from({ length: N }, (_, i) => {
          const n = i + 1
          const touchedNow = people > 0 && n % people === 0
          return (
            <button key={n} type="button" onClick={() => setPicked(n)} aria-label={`Locker ${n}, ${open.has(n) ? 'open' : 'closed'}`} className={cn('aspect-[3/4] rounded border text-[10px] font-semibold transition sm:text-xs', open.has(n) ? 'border-amber-500 bg-amber-300/80 text-amber-950' : 'bg-slate-400/30 text-muted-foreground', touchedNow && 'ring-2 ring-primary', picked === n && 'outline outline-2 outline-offset-1 outline-chem')}>
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => go(people + 1)} disabled={people >= N}>Next person ({Math.min(N, people + 1)})</Button>
        <Button variant="outline" onClick={() => go(people + 10)} disabled={people >= N}>+10 people</Button>
        <Button variant="outline" onClick={() => go(N)} disabled={people >= N}>Run to the end</Button>
        <Button variant="ghost" onClick={() => { setPeople(0); setPicked(null) }}>Reset</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="People so far" value={`${people}`} />
        <Readout label="Open lockers" value={`${open.size}`} />
        <Readout label={picked ? `Locker ${picked} was touched by` : 'Tap a locker'} value={picked ? `${factors(picked).join(', ')} (${factors(picked).length} people)` : '—'} />
      </div>
      {people === N && (
        <p className="mt-3 rounded-xl bg-success-soft px-4 py-2 text-sm">
          Open: <b>{[...open].join(', ')}</b>, the <b>perfect squares</b>! A locker is toggled once for every factor of its number. Factors usually come in pairs (12: 1×12, 2×6, 3×4), so most lockers are toggled an even number of times and end up closed. Only square numbers have a factor paired with itself (36: 6×6), giving an <b>odd</b> number of factors, so they stay open.
        </p>
      )}
    </LabFrame>
  )
}
