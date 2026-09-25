import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

/** Approximate time to break down in the environment (widely used estimates; real times vary with conditions). */
const ITEMS = [
  { id: 'banana', name: 'Banana peel', emoji: '🍌', years: 0.1, label: '2–5 weeks', bio: true },
  { id: 'paper', name: 'Newspaper', emoji: '📰', years: 0.12, label: '~6 weeks', bio: true },
  { id: 'cotton', name: 'Cotton T-shirt', emoji: '👕', years: 0.4, label: '~5 months', bio: true },
  { id: 'wood', name: 'Painted wooden stick', emoji: '🪵', years: 13, label: '~13 years', bio: true },
  { id: 'bag', name: 'Plastic carry bag', emoji: '🛍️', years: 20, label: '10–20 years (only breaks into microplastics)', bio: false },
  { id: 'can', name: 'Aluminium can', emoji: '🥫', years: 200, label: '~200 years', bio: false },
  { id: 'bottle', name: 'Plastic water bottle', emoji: '🧴', years: 450, label: '~450 years', bio: false },
  { id: 'nylon', name: 'Nylon fishing line', emoji: '🎣', years: 600, label: '~600 years', bio: false },
]

export default function PlasticTimeline() {
  const [round, setRound] = useState(0)
  const start = useMemo(() => shuffle(ITEMS.map((i) => i.id)), [round])
  const [order, setOrder] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const remaining = start.filter((id) => !order.includes(id))
  const correctOrder = [...ITEMS].sort((a, b) => a.years - b.years).map((i) => i.id)
  const score = order.filter((id, i) => correctOrder[i] === id).length

  return (
    <LabFrame
      labId="plastic-timeline"
      title="How Long Does It Last?"
      subtitle="Order 8 everyday items from fastest to slowest to break down in nature"
      howTo={<p>Tap the items in order, from the one that breaks down FASTEST to the SLOWEST. Then check your timeline.</p>}
    >
      <div className="flex flex-wrap gap-2">
        {remaining.map((id) => {
          const it = ITEMS.find((i) => i.id === id)!
          return (
            <motion.button layout key={id} type="button" disabled={checked} onClick={() => setOrder((o) => [...o, id])} className="rounded-full border-2 bg-background px-3 py-1.5 text-sm hover:border-chem">
              {it.emoji} {it.name}
            </motion.button>
          )
        })}
        {remaining.length === 0 && !checked && (
          <Button onClick={() => { setChecked(true); (score === ITEMS.length ? sfx.win : sfx.click)() }}>Check my timeline</Button>
        )}
      </div>

      <ol className="mt-4 space-y-1.5">
        {order.map((id, i) => {
          const it = ITEMS.find((x) => x.id === id)!
          const ok = correctOrder[i] === id
          return (
            <motion.li layout key={id} className={cn('flex items-center gap-3 rounded-xl border bg-background px-3 py-2 text-sm', checked && (ok ? 'border-success' : 'border-destructive/60'))}>
              <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
              <span className="text-xl">{it.emoji}</span>
              <span className="flex-1">{it.name}</span>
              {checked && (
                <>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs', it.bio ? 'bg-success-soft' : 'bg-warn-soft')}>{it.bio ? 'biodegradable' : 'non-biodegradable'}</span>
                  <span className="w-44 text-right text-xs text-muted-foreground">{it.label}</span>
                </>
              )}
            </motion.li>
          )
        })}
      </ol>
      {order.length > 0 && !checked && (
        <Button size="sm" variant="ghost" className="mt-2" onClick={() => setOrder([])}>Start over</Button>
      )}

      {checked && (
        <div className="mt-4 space-y-3">
          <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
            {score} / {ITEMS.length} in the right place. A plastic bottle bought today could still be around in the year <b>{new Date().getFullYear() + 450}</b>!
          </p>
          <div className="rounded-xl border bg-background p-3">
            <p className="mb-2 text-sm font-semibold">On a real time scale (logarithmic, so each step is 10×):</p>
            {[...ITEMS].sort((a, b) => a.years - b.years).map((it) => (
              <div key={it.id} className="flex items-center gap-2 text-xs">
                <span className="w-40 truncate">{it.emoji} {it.name}</span>
                <div className="h-3 flex-1 rounded-full bg-muted">
                  <motion.div className={cn('h-full rounded-full', it.bio ? 'bg-success' : 'bg-orange-500')} initial={{ width: 0 }} animate={{ width: `${((Math.log10(it.years) + 1.2) / 4.1) * 100}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => { setRound((r) => r + 1); setOrder([]); setChecked(false) }}>Play again</Button>
        </div>
      )}
    </LabFrame>
  )
}
