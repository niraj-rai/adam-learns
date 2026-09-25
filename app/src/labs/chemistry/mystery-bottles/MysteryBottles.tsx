import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { getIndicator, getSolution } from '../../_kit/ph'
import { LabFrame } from '../../_kit/LabFrame'

const CONTENTS = ['hcl', 'vinegar', 'water', 'salt', 'bakingsoda', 'naoh'] as const
type Content = (typeof CONTENTS)[number]
const LABELS: Record<Content, string> = {
  hcl: 'Dilute hydrochloric acid (strong acid)',
  vinegar: 'Vinegar (weak acid)',
  water: 'Pure water',
  salt: 'Salt water',
  bakingsoda: 'Baking soda solution (weak base)',
  naoh: 'Sodium hydroxide (strong base)',
}
const DISSOLVED_SOLID: Record<Content, boolean> = { hcl: false, vinegar: false, water: false, salt: true, bakingsoda: true, naoh: true }

type Tool = 'blue-litmus' | 'red-litmus' | 'universal' | 'phenolphthalein' | 'magnesium' | 'evaporate'
const TOOLS: { id: Tool; name: string; emoji: string }[] = [
  { id: 'blue-litmus', name: 'Blue litmus', emoji: '🟦' },
  { id: 'red-litmus', name: 'Red litmus', emoji: '🟥' },
  { id: 'universal', name: 'Universal indicator', emoji: '🌈' },
  { id: 'phenolphthalein', name: 'Phenolphthalein', emoji: '🩷' },
  { id: 'magnesium', name: 'Magnesium ribbon', emoji: '🎗️' },
  { id: 'evaporate', name: 'Evaporate a drop', emoji: '🔥' },
]
const BUDGET = 12
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function runTest(tool: Tool, c: Content): { text: string; colour?: string } {
  const pH = getSolution(c).pH
  if (tool === 'magnesium') {
    if (c === 'hcl') return { text: 'Fizzes rapidly!' }
    if (c === 'vinegar') return { text: 'Fizzes slowly' }
    return { text: 'No fizzing' }
  }
  if (tool === 'evaporate') return { text: DISSOLVED_SOLID[c] ? 'White solid left behind' : 'Nothing left behind' }
  const r = getIndicator(tool).colour(pH)
  return { text: r.label, colour: r.hex }
}

export default function MysteryBottles() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [round, setRound] = useState(0)
  const bottles = useMemo(() => shuffle([...CONTENTS]), [round])
  const [tool, setTool] = useState<Tool>('universal')
  const [logs, setLogs] = useState<Record<number, { tool: Tool; text: string; colour?: string }[]>>({})
  const [labels, setLabels] = useState<Record<number, Content | ''>>({})
  const [submitted, setSubmitted] = useState(false)

  const used = Object.values(logs).reduce((a, l) => a + l.length, 0)
  const left = BUDGET - used
  const correct = bottles.filter((c, i) => labels[i] === c).length
  const allLabelled = bottles.every((_, i) => labels[i])
  const stars = submitted && correct === 6 ? (used <= 7 ? 3 : used <= 9 ? 2 : 1) : 0

  const test = (i: number) => {
    if (left <= 0 || submitted) return
    const r = runTest(tool, bottles[i])
    setLogs((l) => ({ ...l, [i]: [...(l[i] ?? []), { tool, ...r }] }))
    sfx.click()
  }

  const submit = () => {
    setSubmitted(true)
    const allRight = bottles.every((c, i) => labels[i] === c)
    if (allRight) {
      sfx.win()
      if (!useProgress.getState().badges.includes('mystery-solver')) addXp(40, 'Mystery bottles solved!')
      awardBadge('mystery-solver')
    } else sfx.wrong()
  }

  const restart = () => {
    setRound((r) => r + 1)
    setLogs({})
    setLabels({})
    setSubmitted(false)
  }

  return (
    <LabFrame
      labId="mystery-bottles"
      title="Boss Challenge: The Mystery Bottles"
      subtitle="Six unlabelled bottles. Identify every one with as few tests as possible."
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Choose a test, then tap a bottle to test a drop from it. You have {BUDGET} tests in total.</li>
          <li>Plan! Which test gives the most information? Which two bottles look identical to indicators?</li>
          <li>Label all six and submit. ⭐⭐⭐ for 7 tests or fewer.</li>
        </ul>
      }
    >
      {submitted && correct === 6 && <Confetti />}
      <p className="mb-3 rounded-xl bg-muted/50 px-4 py-2 text-[15px]">
        🧪 The school lab assistant dropped the labels off six bottles. The chemicals are: <b>{Object.values(LABELS).join(', ')}</b>. Which is which?
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TOOLS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTool(t.id)} className={cn('rounded-full border-2 px-3 py-1.5 text-sm', tool === t.id ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-muted')}>
            {t.emoji} {t.name}
          </button>
        ))}
        <span className={cn('ml-auto rounded-full px-3 py-1 text-sm font-semibold', left <= 2 ? 'bg-warn-soft' : 'bg-muted')}>Tests left: {left}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bottles.map((c, i) => (
          <div key={i} className={cn('rounded-2xl border-2 bg-background p-3', submitted && (labels[i] === c ? 'border-success' : 'border-destructive'))}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => test(i)} disabled={left <= 0 || submitted} className="group relative" aria-label={`Test bottle ${LETTERS[i]} with ${TOOLS.find((t) => t.id === tool)!.name}`}>
                <svg viewBox="0 0 40 70" className="h-16 w-10 transition group-hover:scale-110">
                  <rect x={14} y={2} width={12} height={10} rx={2} fill="#78716c" />
                  <path d="M12 12 h16 v8 q8 4 8 14 v30 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 v-30 q0 -10 8 -14 z" fill="#f1f5f9" stroke="#94a3b8" />
                  <text x={20} y={52} textAnchor="middle" fontSize={16} fontWeight={700} fill="#334155">{LETTERS[i]}</text>
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold">Bottle {LETTERS[i]}</p>
                <p className="text-xs text-muted-foreground">Tap the bottle to test it</p>
              </div>
            </div>
            <ul className="mt-2 min-h-10 space-y-1 text-xs" aria-live="polite">
              {(logs[i] ?? []).map((l, k) => (
                <motion.li key={k} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5">
                  {l.colour && <span className="inline-block size-3 rounded-full border border-black/20" style={{ background: l.colour }} />}
                  <b>{TOOLS.find((t) => t.id === l.tool)!.name}:</b> {l.text}
                </motion.li>
              ))}
            </ul>
            <select
              value={labels[i] ?? ''}
              disabled={submitted}
              onChange={(e) => setLabels((x) => ({ ...x, [i]: e.target.value as Content }))}
              className="mt-2 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
              aria-label={`Label for bottle ${LETTERS[i]}`}
            >
              <option value="">Choose a label…</option>
              {CONTENTS.map((k) => (
                <option key={k} value={k}>{LABELS[k]}</option>
              ))}
            </select>
            {submitted && labels[i] !== c && <p className="mt-1 text-xs text-destructive">Actually: {LABELS[c]}</p>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={!allLabelled || submitted} onClick={submit}>Submit my labels</Button>
        <Button size="lg" variant="ghost" onClick={restart}>New set of bottles</Button>
      </div>

      {submitted && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('mt-4 rounded-2xl border p-4 text-sm', correct === 6 ? 'border-success/50 bg-success-soft' : 'bg-warn-soft')}>
          <p className="font-heading text-lg font-semibold">
            {correct === 6 ? `🕵️ All six identified! ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}` : `${correct} / 6 correct`}
          </p>
          <p className="mt-1">You used {used} tests. A smart plan: <b>universal indicator</b> on every bottle gives pH 1, 3, 7, 7, 8 and 14. The two pH 7 bottles look identical, so <b>evaporate</b> a drop of one: salt water leaves a white solid, pure water leaves nothing. That's 7 tests.</p>
        </motion.div>
      )}
    </LabFrame>
  )
}
