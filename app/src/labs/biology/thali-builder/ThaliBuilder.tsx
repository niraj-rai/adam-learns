import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { assess, type Group, GROUPS, ITEMS } from './model'

export default function ThaliBuilder() {
  const addXp = useProgress((s) => s.addXp)
  const [plate, setPlate] = useState<string[]>(['samosa', 'cola'])
  const [checked, setChecked] = useState(false)
  const [rewarded, setRewarded] = useState(false)
  const a = assess(plate)
  const add = (id: string) => { if (plate.length < 10) { setPlate((p) => [...p, id]); setChecked(false) } }
  const remove = (i: number) => { setPlate((p) => p.filter((_, j) => j !== i)); setChecked(false) }
  const check = () => {
    setChecked(true)
    if (a.balanced) { sfx.win(); if (!rewarded) { setRewarded(true); addXp(10, 'Balanced thali!') } } else sfx.wrong()
  }
  return (
    <LabFrame labId="thali-builder" title="Build a Balanced Thali" subtitle="A balanced diet has the right amounts of every food group. Can you plan a healthy lunch?" howTo={<p>Tap foods to add them to your thali (tap a food on the plate to remove it). Aim to fill each food group's bar into the green zone, then check your thali.</p>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="relative grid min-h-44 place-items-center rounded-full border-8 border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-800">
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {plate.length === 0 && <span className="text-sm text-muted-foreground">Empty plate</span>}
              {plate.map((id, i) => {
                const it = ITEMS.find((x) => x.id === id)!
                return <button key={`${id}-${i}`} type="button" onClick={() => remove(i)} title="Remove" className="rounded-full bg-background px-2 py-1 text-sm shadow-sm">{it.emoji} {it.name}</button>
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ITEMS.map((it) => <button key={it.id} type="button" onClick={() => add(it.id)} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">{it.emoji} {it.name}</button>)}
          </div>
        </div>
        <div className="space-y-2">
          {(Object.keys(GROUPS) as Group[]).map((g) => {
            const G = GROUPS[g]
            const n = a.counts[g]
            const ok = n >= G.target[0] && n <= G.target[1]
            return (
              <div key={g} className="text-sm">
                <div className="flex justify-between"><span>{G.emoji} {G.name}</span><span className={cn(ok ? 'text-success' : 'text-destructive')}>{n} (aim {G.target[0]}–{G.target[1]})</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn('h-2 rounded-full', ok ? 'bg-success' : n > G.target[1] ? 'bg-destructive' : 'bg-amber-400')} style={{ width: `${Math.min(100, (n / Math.max(1, G.target[1] + 1)) * 100)}%` }} /></div>
              </div>
            )
          })}
          <Button className="mt-2 w-full" onClick={check}>🍽️ Check my thali</Button>
          <Button variant="ghost" className="w-full" onClick={() => { setPlate([]); setChecked(false) }}>↺ Clear plate</Button>
        </div>
      </div>
      {checked && (
        <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', a.balanced ? 'bg-success-soft' : 'bg-warn-soft')}>
          {a.balanced ? '✅ A balanced thali! Energy from cereals, protein for growth, vitamins and minerals from vegetables and fruit, calcium from dairy, and only a little (or no) junk food. Remember to drink water too.' : `Not balanced yet. ${a.low.length ? `Add more: ${a.low.map((g) => GROUPS[g].name.toLowerCase()).join(', ')} (${a.low.map((g) => GROUPS[g].why.toLowerCase()).join('; ')}). ` : ''}${a.high.length ? `Too much: ${a.high.map((g) => GROUPS[g].name.toLowerCase()).join(', ')}.` : ''}`}
        </p>
      )}
    </LabFrame>
  )
}
