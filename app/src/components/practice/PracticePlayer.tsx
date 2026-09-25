import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Question } from '@/content/schema'
import { MASTERY_THRESHOLD, XP } from '@/lib/levels'
import { sfx } from '@/lib/sound'
import { Confetti } from '@/components/gamification/Confetti'
import { QuestionView, type QuestionResult } from './QuestionView'

export type PracticeSummary = {
  score: number
  correctIds: string[]
  wrongIds: string[]
  xp: number
}

/** Orders questions from easier to harder, mixing types within each difficulty. */
function arrange(questions: Question[]) {
  const byDiff = [1, 2, 3].map((d) => questions.filter((q) => q.difficulty === d).sort(() => Math.random() - 0.5))
  return byDiff.flat()
}

export function PracticePlayer({
  questions,
  onFinish,
  finishLabel,
  onFinishAction,
  onRetry,
}: {
  questions: Question[]
  onFinish: (s: PracticeSummary) => void
  finishLabel?: string
  onFinishAction?: () => void
  onRetry?: () => void
}) {
  const ordered = useMemo(() => arrange(questions), [questions])
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Record<string, QuestionResult>>({})
  const [summary, setSummary] = useState<PracticeSummary | null>(null)

  const q = ordered[index]

  const done = (r: QuestionResult) => {
    const next = { ...results, [q.id]: r }
    setResults(next)
    if (index + 1 < ordered.length) {
      setIndex(index + 1)
      return
    }
    const points = ordered.reduce((sum, x) => sum + (next[x.id]?.firstTry ? 1 : next[x.id]?.correct ? 0.5 : 0), 0)
    const score = points / ordered.length
    const correctIds = ordered.filter((x) => next[x.id]?.correct).map((x) => x.id)
    const wrongIds = ordered.filter((x) => !next[x.id]?.correct).map((x) => x.id)
    const xp = correctIds.length * XP.correctAnswer + ordered.filter((x) => next[x.id]?.firstTry).length * XP.correctFirstTry
    const s = { score, correctIds, wrongIds, xp }
    setSummary(s)
    if (score >= MASTERY_THRESHOLD) sfx.win()
    onFinish(s)
  }

  if (summary) {
    const pct = Math.round(summary.score * 100)
    const mastered = summary.score >= MASTERY_THRESHOLD
    return (
      <div className="space-y-5">
        {mastered && <Confetti />}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border bg-card p-6 text-center">
          <p className="text-6xl">{pct === 100 ? '💎' : mastered ? '🏆' : pct >= 50 ? '💪' : '🌱'}</p>
          <p className="mt-2 font-heading text-4xl font-bold">{pct}%</p>
          <p className="mt-1 text-lg font-semibold">{mastered ? 'Topic mastered!' : 'Good effort. Keep going!'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mastered
              ? 'You scored 80% or more. The questions you missed will come back in your Review queue.'
              : 'Score 80% or more to master this topic. Missed questions are added to your Review queue.'}
          </p>
          <p className="mt-3 inline-block rounded-full bg-chem-soft px-3 py-1 text-sm font-semibold">+{summary.xp} XP</p>
        </motion.div>

        <ul className="space-y-1.5">
          {ordered.map((x) => (
            <li key={x.id} className="flex items-start gap-2 text-sm">
              <span>{results[x.id]?.firstTry ? '✅' : results[x.id]?.correct ? '☑️' : '❌'}</span>
              <span className="text-muted-foreground">{x.prompt}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button size="lg" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
          {onFinishAction && (
            <Button size="lg" onClick={onFinishAction}>
              {finishLabel ?? 'Continue'} →
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Progress value={(index / ordered.length) * 100} className="h-2.5 flex-1" />
        <span className="text-sm tabular-nums text-muted-foreground">
          {index + 1} / {ordered.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
          <QuestionView q={q} onDone={done} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
