import { motion } from 'motion/react'
import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { QUESTIONS, TRAVELLERS, chartData } from './data'

export default function BengaluruRace() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [num, setNum] = useState('')
  const q = QUESTIONS[i]
  const done = i >= QUESTIONS.length || hearts === 0
  const won = i >= QUESTIONS.length && hearts > 0

  const answer = (ok: boolean) => {
    if (feedback) return
    setFeedback({ ok, text: q.explain })
    if (ok) {
      setScore((s) => s + 1)
      sfx.correct()
    } else {
      setHearts((h) => h - 1)
      sfx.wrong()
    }
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setFeedback(null)
    setNum('')
    if (n >= QUESTIONS.length && hearts > 0) {
      sfx.win()
      if (!useProgress.getState().badges.includes('race-analyst')) addXp(25 + hearts * 10, 'Race Analyst!')
      awardBadge('race-analyst')
    }
  }

  return (
    <LabFrame labId="bengaluru-race" title="Boss Challenge: The Great Bengaluru Race" subtitle="Four travellers, one graph. Read it like a scientist." howTo={<p>Four friends race 20 km from Majestic to Whitefield. Use the distance–time graph to answer 8 questions. Hover over the graph to read exact values. A wrong answer costs a ❤️.</p>}>
      {won && <Confetti />}
      <div className="h-72 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 18, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="t" type="number" domain={[0, 60]} ticks={[0, 10, 20, 30, 40, 50, 60]} tick={{ fontSize: 11 }} label={{ value: 'time (minutes)', position: 'insideBottom', offset: -10, fontSize: 11 }} />
            <YAxis domain={[0, 20]} ticks={[0, 4, 8, 12, 16, 20]} tick={{ fontSize: 11 }} width={34} label={{ value: 'distance (km)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Whitefield', fontSize: 10, position: 'insideTopLeft' }} />
            <Tooltip formatter={(v, n) => [`${v} km`, TRAVELLERS.find((t) => t.id === n)?.name ?? n]} labelFormatter={(l) => `${l} min`} />
            <Legend formatter={(v) => { const t = TRAVELLERS.find((x) => x.id === v); return `${t?.emoji} ${t?.name}` }} wrapperStyle={{ fontSize: 12 }} verticalAlign="top" height={28} />
            {TRAVELLERS.map((t) => (
              <Line key={t.id} dataKey={t.id} stroke={t.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-muted-foreground">Question {Math.min(i + 1, QUESTIONS.length)} / {QUESTIONS.length} · Correct {score}</span>
      </div>

      {done ? (
        <div className={cn('mt-3 rounded-2xl border-2 p-5 text-center', won ? 'border-success/50 bg-success-soft' : 'border-destructive/40 bg-destructive/5')}>
          <p className="text-4xl">{won ? '🏁' : '📉'}</p>
          <p className="mt-1 font-heading text-xl font-semibold">{won ? `Race Analyst! ${score} / ${QUESTIONS.length} ${'⭐'.repeat(hearts)}` : 'Out of lives. Graph reading takes practice!'}</p>
          <p className="mt-1 text-sm">Remember: steeper = faster · flat = stopped · straight line = constant speed.</p>
          <Button className="mt-3" variant="outline" onClick={() => { setI(0); setHearts(3); setScore(0); setFeedback(null); setNum('') }}>Play again</Button>
        </div>
      ) : (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2 rounded-2xl border bg-chem-soft p-4">
          <p className="font-heading text-lg font-semibold">{q.q}</p>
          {q.kind === 'pick' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRAVELLERS.map((t) => (
                <Button key={t.id} variant="outline" disabled={Boolean(feedback)} onClick={() => answer(t.id === q.answer)} className="bg-background">{t.emoji} {t.name}</Button>
              ))}
            </div>
          )}
          {q.kind === 'choice' && (
            <div className="grid gap-2 sm:grid-cols-3">
              {q.options.map((o, k) => (
                <Button key={o} variant="outline" disabled={Boolean(feedback)} onClick={() => answer(k === q.answer)} className="bg-background">{o}</Button>
              ))}
            </div>
          )}
          {q.kind === 'number' && (
            <div className="flex flex-wrap items-center gap-2">
              <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="decimal" disabled={Boolean(feedback)} className="h-9 w-28 rounded-lg border bg-background px-3 text-sm" aria-label="Your answer" />
              <span className="text-sm">{q.unit}</span>
              <Button size="sm" disabled={!num || Boolean(feedback)} onClick={() => answer(Math.abs(Number(num) - q.answer) <= q.tolerance)}>Check</Button>
            </div>
          )}
          {feedback && (
            <div role="status" className={cn('rounded-lg p-3 text-sm', feedback.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              {feedback.ok ? '✅ ' : '❌ '}{feedback.text}
              <Button size="sm" className="ml-2" autoFocus onClick={next}>{i + 1 < QUESTIONS.length ? 'Next →' : 'Finish'}</Button>
            </div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
