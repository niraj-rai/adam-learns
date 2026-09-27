import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { findQuestion } from '@/components/exam/pool'
import { usePracticeSets } from '@/content/usePractice'
import { getTopicByKey } from '@/content/loader'
import { criterionName } from '@/lib/criteria'
import { LENGTHS, criterionLevel, mypGrade, weakTopics, type Criterion, type PaperResult, type Tally } from '@/lib/exam'
import { formatDuration } from '@/lib/timeTracking'
import { cn } from '@/lib/utils'
import { useExams } from '@/stores/exams'

export const Route = createFileRoute('/exams/result')({
  validateSearch: (s: Record<string, unknown>): { id: string } => ({ id: typeof s.id === 'string' ? s.id : String(s.id ?? '') }),
  component: ResultPage,
})

const pct = (t: Tally) => (t.total ? Math.round((100 * t.earned) / t.total) : 0)

function Bar({ label, t, href }: { label: string; t: Tally; href?: { subject: string; unit: string; topic: string } }) {
  const p = pct(t)
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-sm">
        {href ? <Link to="/$subject/$unit/$topic" params={href} className="min-w-0 truncate font-medium hover:underline">{label}</Link> : <span className="min-w-0 truncate font-medium">{label}</span>}
        <span className="shrink-0 tabular-nums text-muted-foreground">{t.earned}/{t.total}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${label}: ${p}%`}>
        <div className={cn('h-full rounded-full', p >= 75 ? 'bg-success' : p >= 50 ? 'bg-warn' : 'bg-destructive')} style={{ width: `${p}%` }} />
      </div>
    </div>
  )
}

function ResultPage() {
  const { id } = Route.useSearch()
  const record = useExams((s) => s.history.find((h) => h.id === id))
  // the answer review needs the questions you lost marks on
  usePracticeSets((record?.items ?? []).filter((i) => i.earned < i.marks).map((i) => i.topicKey))
  if (!record) {
    return (
      <div className="mx-auto max-w-xl space-y-3 py-10 text-center">
        <p className="text-5xl">📭</p>
        <p className="font-heading text-2xl font-semibold">That result isn't on this device.</p>
        <Button asChild><Link to="/exams">Back to exam practice</Link></Button>
      </div>
    )
  }
  const overall = { earned: record.earned, total: record.total }
  const p = pct(overall)
  const weak = weakTopics(record as unknown as PaperResult)
  const levels = (Object.entries(record.criteria) as [Criterion, Tally][]).sort(([a], [b]) => a.localeCompare(b))
  const missed = (record.items ?? []).filter((i) => i.earned < i.marks)
  const topicParams = (key: string) => {
    const [subject, unit, topic] = key.split('/')
    return { subject, unit, topic }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-3xl bg-brand p-6 text-white">
        <p className="text-sm opacity-90">{record.title} · {record.format === 'cbse' ? 'CBSE style' : 'IB MYP style'} · {LENGTHS[record.length].label} · {record.date}</p>
        <p className="mt-2 font-heading text-5xl font-bold tabular-nums">{record.earned}<span className="text-2xl opacity-80">/{record.total}</span></p>
        <p className="mt-1 text-lg">
          {p}% · {p >= 90 ? '🌟 Outstanding!' : p >= 75 ? '🎉 Great work!' : p >= 50 ? '👍 Good effort: a few things to revise.' : '💪 Keep going: revise the topics below and try again.'}
        </p>
        <p className="mt-1 text-sm opacity-90">Time used: {formatDuration(record.secondsUsed)} of {LENGTHS[record.length].minutes} min</p>
      </header>

      {record.format === 'ib' && levels.length > 0 && (
        <section className="rounded-2xl border p-4">
          <h2 className="font-heading text-xl font-semibold">IB criteria</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {levels.map(([c, t]) => (
              <div key={c} className="rounded-xl bg-muted/50 p-3">
                <p className="text-sm font-semibold">Criterion {c}: {criterionName(c, record.subjectId, true)}</p>
                <p className="font-heading text-2xl font-bold">{criterionLevel(t)}<span className="text-sm text-muted-foreground"> / 8</span></p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm">Approximate MYP grade: <b className="text-lg">{mypGrade(levels.map(([, t]) => criterionLevel(t)))}</b> / 7 <span className="text-muted-foreground">(a practice estimate: your teacher's judgement uses the full criteria)</span></p>
        </section>
      )}

      {record.format === 'cbse' && (
        <section className="space-y-3 rounded-2xl border p-4">
          <h2 className="font-heading text-xl font-semibold">By section</h2>
          {Object.entries(record.sections).sort(([a], [b]) => a.localeCompare(b)).map(([s, t]) => <Bar key={s} label={`Section ${s}`} t={t} />)}
        </section>
      )}

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="font-heading text-xl font-semibold">By topic</h2>
        {Object.entries(record.topics).sort((a, b) => pct(a[1]) - pct(b[1])).map(([k, t]) => <Bar key={k} label={getTopicByKey(k)?.title ?? k} t={t} href={topicParams(k)} />)}
      </section>

      {weak.length > 0 && (
        <section className="rounded-2xl border-2 border-warn/60 bg-warn-soft p-4">
          <h2 className="font-heading text-xl font-semibold">🔧 Revise these next</h2>
          <ul className="mt-2 list-inside list-disc text-sm">
            {weak.map((k) => <li key={k}><Link to="/$subject/$unit/$topic" params={topicParams(k)} className="font-semibold hover:underline">{getTopicByKey(k)?.title ?? k}</Link></li>)}
          </ul>
          {missed.length > 0 && <p className="mt-2 text-sm">The {missed.length} question(s) you lost marks on were added to <Link to="/review" className="font-semibold underline">Review</Link>, so they come back tomorrow.</p>}
        </section>
      )}

      {missed.length > 0 && (
        <details className="rounded-2xl border p-4">
          <summary className="cursor-pointer font-heading text-lg font-semibold">Answers to the questions you lost marks on</summary>
          <ol className="mt-3 space-y-3">
            {missed.map((i) => {
              const q = findQuestion(i.topicKey, i.questionId)
              if (!q) return null
              return (
                <li key={`${i.topicKey}#${i.questionId}`} className="rounded-xl bg-muted/40 p-3 text-sm">
                  <p className="font-semibold">{q.prompt} <span className="font-normal text-muted-foreground">({i.earned}/{i.marks})</span></p>
                  {q.type === 'mcq' && <p className="mt-1">✅ {q.options[q.answer]}</p>}
                  {q.type === 'numeric' && <p className="mt-1">✅ {q.answer}{q.unit ? ` ${q.unit}` : ''}</p>}
                  {q.type === 'short-answer' && <p className="mt-1">✅ {q.modelAnswer}</p>}
                  <p className="mt-1 text-muted-foreground">{q.explain}</p>
                </li>
              )
            })}
          </ol>
        </details>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild><Link to="/exams">Try another paper</Link></Button>
        <Button variant="outline" asChild><Link to="/review">Go to Review</Link></Button>
      </div>
    </div>
  )
}
