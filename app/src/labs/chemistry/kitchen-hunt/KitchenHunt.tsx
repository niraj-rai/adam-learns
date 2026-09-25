import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { getIndicator, getSolution, natureOf, type Nature } from '../../_kit/ph'
import { LabFrame } from '../../_kit/LabFrame'

const ITEMS = ['lemon', 'vinegar', 'tamarind', 'curd', 'tomato', 'milk', 'water', 'sugar', 'salt', 'bakingsoda', 'soap', 'toothpaste', 'antacid'].map(getSolution)
const blue = getIndicator('blue-litmus')
const red = getIndicator('red-litmus')

function Strip({ colour }: { colour: string }) {
  return (
    <svg viewBox="0 0 20 70" className="h-20 w-6" aria-hidden>
      <rect x={2} y={2} width={16} height={66} rx={2} fill={colour} stroke="rgba(0,0,0,.2)" />
    </svg>
  )
}

export default function KitchenHunt() {
  const [itemId, setItemId] = useState(ITEMS[0].id)
  const [tests, setTests] = useState<Record<string, { blue?: boolean; red?: boolean }>>({})
  const [answers, setAnswers] = useState<Record<string, Nature>>({})
  const item = ITEMS.find((i) => i.id === itemId)!
  const t = tests[itemId] ?? {}
  const truth = natureOf(item.pH)
  const score = ITEMS.filter((i) => answers[i.id] === natureOf(i.pH)).length

  const dip = (which: 'blue' | 'red') => {
    setTests((x) => ({ ...x, [itemId]: { ...x[itemId], [which]: true } }))
    sfx.click()
  }
  const answer = (n: Nature) => {
    if (answers[itemId]) return
    setAnswers((a) => ({ ...a, [itemId]: n }))
    ;(n === truth ? sfx.correct : sfx.wrong)()
  }

  return (
    <LabFrame
      labId="kitchen-hunt"
      title="Kitchen Acid Hunt"
      subtitle="Test 13 things from the kitchen and bathroom with litmus paper"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Pick an item. Dip a <b>blue</b> and a <b>red</b> litmus strip into it.</li>
          <li>Blue → red means <b>acidic</b>. Red → blue means <b>basic</b>. No change in either means <b>neutral</b>.</li>
          <li>Classify all 13 items!</li>
        </ul>
      }
    >
      <p className="mb-3 rounded-lg bg-warn-soft px-3 py-2 text-sm">⚠️ Scientists never identify substances by tasting or touching them. That can be dangerous! Indicators do the job safely.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {ITEMS.map((i) => (
          <button key={i.id} type="button" onClick={() => setItemId(i.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', i.id === itemId ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {i.emoji} {i.name} {answers[i.id] && (answers[i.id] === natureOf(i.pH) ? '✅' : '❌')}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="flex items-end justify-center gap-10 rounded-2xl border bg-background p-6">
          <div className="text-center">
            <p className="text-6xl">{item.emoji}</p>
            <p className="mt-2 font-heading text-lg font-semibold">{item.name}</p>
          </div>
          <div className="flex gap-4">
            {(['blue', 'red'] as const).map((w) => {
              const ind = w === 'blue' ? blue : red
              const dipped = Boolean(t[w])
              const res = ind.colour(item.pH)
              return (
                <div key={w} className="flex flex-col items-center gap-1">
                  <motion.div animate={dipped ? { y: [0, 20, 0] } : { y: 0 }} transition={{ duration: 0.6 }}>
                    <Strip colour={dipped ? res.hex : ind.start} />
                  </motion.div>
                  <Button size="sm" variant="outline" onClick={() => dip(w)} disabled={dipped}>
                    Dip {w}
                  </Button>
                  {dipped && <span className="text-xs">{res.label}</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border bg-chem-soft p-3">
          <p className="text-sm font-semibold">What is {item.name.toLowerCase()}?</p>
          {(['acidic', 'neutral', 'basic'] as Nature[]).map((n) => (
            <Button
              key={n}
              className="w-full justify-start capitalize"
              disabled={!t.blue || !t.red || Boolean(answers[itemId])}
              variant={answers[itemId] === n ? (n === truth ? 'default' : 'destructive') : 'outline'}
              onClick={() => answer(n)}
            >
              {n}
            </Button>
          ))}
          {(!t.blue || !t.red) && <p className="text-xs text-muted-foreground">Dip both strips first.</p>}
          {answers[itemId] && (
            <p role="status" className="text-sm">
              {answers[itemId] === truth ? '✅ Correct!' : `❌ It is ${truth}.`} {item.note ?? ''}
            </p>
          )}
          <p className="pt-2 text-center text-sm">
            Score: <b>{score}</b> / {ITEMS.length}
          </p>
        </div>
      </div>
    </LabFrame>
  )
}
