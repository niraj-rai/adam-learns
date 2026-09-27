import { Link, Navigate, createFileRoute } from '@tanstack/react-router'
import { Flag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Answer } from '@/components/practice/QuestionView'
import { Button } from '@/components/ui/button'
import { findQuestion } from '@/components/exam/pool'
import { getTopicByKey } from '@/content/loader'
import type { Question } from '@/content/schema'
import { localDate } from '@/lib/dates'
import { criterionName } from '@/lib/criteria'
import { itemKey, scorePaper, type Criterion, type PaperItem } from '@/lib/exam'
import { emptyResponse, isComplete, type Response } from '@/lib/grading'
import { cn } from '@/lib/utils'
import { useExams, type ActiveExam } from '@/stores/exams'
import { useProgress } from '@/stores/progress'

export const Route = createFileRoute('/exams/paper')({ component: PaperPage })

const clock = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

type Entry = { item: PaperItem; q: Question; n: number; section: string }

function PaperPage() {
  const active = useExams((s) => s.active)
  const lastFinished = useExams((s) => s.lastFinished)
  if (!active) return lastFinished ? <Navigate to="/exams/result" search={{ id: lastFinished }} /> : <Navigate to="/exams" />
  return active.submittedAt ? <MarkingStep exam={active} /> : <Writing exam={active} />
}

function useEntries(exam: ActiveExam): Entry[] {
  return useMemo(() => {
    let n = 0
    return exam.paper.sections.flatMap((s) =>
      s.items.flatMap((item) => {
        const q = findQuestion(item.topicKey, item.questionId)
        return q ? [{ item, q, n: ++n, section: s.id }] : []
      }),
    )
  }, [exam.paper])
}

const responseFor = (exam: ActiveExam, e: Entry): Response => exam.responses[itemKey(e.item)] ?? emptyResponse(e.q)
/** In an exam a written answer counts once there is some text; it is marked after handing in. */
const answered = (exam: ActiveExam, e: Entry) => {
  const r = exam.responses[itemKey(e.item)]
  if (!r) return false
  return r.type === 'short-answer' ? r.text.trim().length > 0 : isComplete(e.q, r)
}

function Writing({ exam }: { exam: ActiveExam }) {
  const { answer, toggleFlag, submit } = useExams()
  const entries = useEntries(exam)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const left = exam.deadline - now
  useEffect(() => {
    if (left <= 0) submit() // time's up: hand in automatically
  }, [left, submit])

  const done = entries.filter((e) => answered(exam, e)).length
  const handIn = () => {
    const missing = entries.length - done
    if (missing === 0 || window.confirm(`${missing} question(s) not answered yet. Hand in anyway?`)) submit()
  }
  const sectionOf = (id: string) => {
    const s = exam.paper.sections.find((x) => x.id === id)!
    // IB sections use the subject's own criterion names
    return exam.paper.format === 'ib' ? { ...s, title: `Criterion ${id}: ${criterionName(id as Criterion, exam.subjectId, true)}` } : s
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-2 backdrop-blur print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold">{exam.title} · {exam.paper.totalMarks} marks</p>
          <div className="flex items-center gap-3">
            <span className={cn('font-mono text-lg font-bold tabular-nums', left < 5 * 60_000 && 'text-destructive')} aria-live="off" aria-label="Time left">⏱️ {clock(left)}</span>
            <Button onClick={handIn}>Hand in</Button>
          </div>
        </div>
        <nav className="mt-2 flex flex-wrap gap-1" aria-label="Questions">
          {entries.map((e) => {
            const key = itemKey(e.item)
            return (
              <a key={key} href={`#q-${e.n}`} className={cn('grid size-7 place-items-center rounded-md border text-xs font-semibold', answered(exam, e) && 'border-brand bg-brand-soft', exam.flagged.includes(key) && 'ring-2 ring-warn')} aria-label={`Question ${e.n}${answered(exam, e) ? ', answered' : ''}${exam.flagged.includes(key) ? ', flagged' : ''}`}>
                {e.n}
              </a>
            )
          })}
        </nav>
        <p className="mt-1 text-xs text-muted-foreground">{done} of {entries.length} answered · your answers are saved as you go</p>
      </div>

      {entries.map((e, i) => {
        const key = itemKey(e.item)
        const r = responseFor(exam, e)
        const newSection = i === 0 || entries[i - 1].section !== e.section
        return (
          <div key={key}>
            {newSection && (
              <div className="mb-3 mt-6">
                <h2 className="font-heading text-xl font-semibold">{sectionOf(e.section).title}</h2>
                <p className="text-sm text-muted-foreground">{sectionOf(e.section).note}</p>
              </div>
            )}
            <article id={`q-${e.n}`} className="scroll-mt-40 space-y-3 rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-lg font-semibold leading-snug"><span className="text-muted-foreground">{e.n}.</span> {e.q.prompt}</p>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">[{e.item.marks}]</span>
                  <Button variant="ghost" size="icon" aria-pressed={exam.flagged.includes(key)} aria-label="Flag to come back to" onClick={() => toggleFlag(key)}>
                    <Flag className={cn('size-4', exam.flagged.includes(key) && 'fill-warn text-warn')} />
                  </Button>
                </div>
              </div>
              {e.q.type === 'short-answer' && r.type === 'short-answer' ? (
                <textarea value={r.text} onChange={(ev) => answer(key, { ...r, text: ev.target.value })} rows={5} className="w-full rounded-xl border-2 bg-background p-3 text-[15px]" placeholder="Write your full answer. You'll mark it against the scheme after handing in." aria-label={`Answer to question ${e.n}`} />
              ) : (
                <Answer q={e.q} response={r} onChange={(nr) => answer(key, nr)} locked={false} grade={null} />
              )}
            </article>
          </div>
        )
      })}
      <div className="flex justify-end">
        <Button size="lg" onClick={handIn}>Hand in the paper</Button>
      </div>
    </div>
  )
}

/** After handing in: written answers are self-marked against the scheme, then the paper is scored. */
function MarkingStep({ exam }: { exam: ActiveExam }) {
  const { answer, finish } = useExams()
  const addToReview = useProgress((s) => s.addToReview)
  const entries = useEntries(exam)
  const written = entries.filter((e) => e.q.type === 'short-answer')

  const complete = () => {
    const result = scorePaper(exam.paper, findQuestion, exam.responses)
    addToReview(result.items.filter((i) => i.earned < i.marks).map(({ topicKey, questionId }) => ({ topicKey, questionId })))
    finish({
      id: exam.id,
      subjectId: exam.subjectId,
      grade: exam.grade,
      title: exam.title,
      format: exam.paper.format,
      length: exam.paper.length,
      date: localDate(),
      secondsUsed: Math.round(Math.min(exam.submittedAt! - exam.startedAt, exam.paper.minutes * 60_000) / 1000),
      earned: result.earned,
      total: result.total,
      sections: result.sections,
      topics: result.topics,
      criteria: result.criteria,
      items: result.items.map(({ topicKey, questionId, marks, earned }) => ({ topicKey, questionId, marks, earned })),
    })
    // clearing the active paper re-renders this page, which then shows the results
  }

  // nothing to self-mark: go straight to the results
  useEffect(() => {
    if (written.length === 0) complete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (written.length === 0) return null

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="font-heading text-3xl font-bold">✍️ Mark your written answers</h1>
        <p className="mt-1 text-muted-foreground">Compare each answer with the model answer and tick every point you really made. Be honest: examiners are strict!</p>
      </header>
      {written.map((e) => {
        const key = itemKey(e.item)
        const r = responseFor(exam, e)
        const shown: Response = r.type === 'short-answer' ? { ...r, revealed: true } : r
        return (
          <article key={key} className="space-y-3 rounded-2xl border bg-card p-4">
            <p className="font-heading text-lg font-semibold">{e.n}. {e.q.prompt} <span className="text-sm text-muted-foreground">[{e.item.marks}]</span></p>
            {r.type === 'short-answer' && !r.text.trim() && <p className="text-sm text-muted-foreground">You didn't write an answer.</p>}
            <Answer q={e.q} response={shown} onChange={(nr) => answer(key, nr)} locked={false} grade={null} />
            <p className="text-xs text-muted-foreground">From {getTopicByKey(e.item.topicKey)?.title}</p>
          </article>
        )
      })}
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" asChild><Link to="/exams">Back</Link></Button>
        <Button size="lg" onClick={complete}>See my results</Button>
      </div>
    </div>
  )
}
