import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { LADDERS, type Level, LEVELS, SORT_ITEMS } from './model'

export default function OrganisationZoom() {
  const [which, setWhich] = useState<'human' | 'plant'>('human')
  const [lv, setLv] = useState(4)
  const [answers, setAnswers] = useState<Record<string, Level>>({})
  const [sel, setSel] = useState<string | null>(null)
  const step = LADDERS[which][lv]
  const correct = SORT_ITEMS.filter((i) => answers[i.label] === i.level).length
  const place = (l: Level) => {
    if (!sel) return
    const item = SORT_ITEMS.find((i) => i.label === sel)!
    if (item.level === l) { sfx.correct(); setAnswers((a) => ({ ...a, [sel]: l })); setSel(null) } else sfx.wrong()
  }
  return (
    <LabFrame labId="organisation-zoom" title="Zoom Ladder" subtitle="From one cell to a whole living thing: five levels of organisation." howTo={<p>Zoom in and out through the levels for a human or a plant. Then sort ten examples onto the right rung of the ladder.</p>}>
      <div className="mb-3 flex gap-2">
        {(['human', 'plant'] as const).map((w) => <Button key={w} size="sm" variant={w === which ? 'default' : 'outline'} onClick={() => setWhich(w)}>{w === 'human' ? '🧒 Human' : '🥭 Plant'}</Button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <ol className="space-y-1">
          {[...LEVELS].reverse().map((l) => {
            const i = LEVELS.indexOf(l)
            return <li key={l}><button type="button" onClick={() => setLv(i)} className={cn('w-full rounded-lg border px-3 py-1.5 text-left text-sm', i === lv ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{l}</button></li>
          })}
        </ol>
        <motion.div key={`${which}-${lv}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-background p-6 text-center">
          <span className="text-6xl">{step.emoji}</span>
          <p className="font-heading text-xl font-semibold">{step.level}: {step.name}</p>
          <p className="max-w-md text-sm text-muted-foreground">{step.text}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={lv === 0} onClick={() => setLv((x) => x - 1)}>🔍 Zoom in</Button>
            <Button size="sm" variant="outline" disabled={lv === 4} onClick={() => setLv((x) => x + 1)}>🔭 Zoom out</Button>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 rounded-2xl border p-3">
        <p className="mb-2 text-sm font-semibold">Sort onto the ladder ({correct}/{SORT_ITEMS.length})</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SORT_ITEMS.filter((i) => !answers[i.label]).map((i) => <button key={i.label} type="button" onClick={() => setSel(i.label)} className={cn('rounded-full border px-3 py-1 text-sm', sel === i.label ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{i.label}</button>)}
        </div>
        <div className="grid gap-2 sm:grid-cols-5">
          {LEVELS.map((l) => (
            <button key={l} type="button" onClick={() => place(l)} className="min-h-20 rounded-xl border-2 border-dashed p-2 text-left text-xs">
              <b>{l}</b>
              {SORT_ITEMS.filter((i) => answers[i.label] === l).map((i) => <span key={i.label} className="mt-1 block rounded bg-success-soft px-1">{i.label}</span>)}
            </button>
          ))}
        </div>
        {correct === SORT_ITEMS.length && <p role="status" className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-sm">✅ All sorted! Cells → tissues → organs → organ systems → organism. Each level is made of the one below it.</p>}
      </div>
    </LabFrame>
  )
}
