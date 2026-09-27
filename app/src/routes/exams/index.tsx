import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { examPool, examTopicKeys, unitsForGrade } from '@/components/exam/pool'
import { usePracticeSets } from '@/content/usePractice'
import { getSubject, getSubjects } from '@/content/loader'
import { LENGTHS, buildPaper, type ExamFormat, type ExamLength } from '@/lib/exam'
import { effectiveGrade } from '@/lib/learner'
import { cn } from '@/lib/utils'
import { useExams } from '@/stores/exams'
import { useProfile, type Grade } from '@/stores/profile'

export const Route = createFileRoute('/exams/')({ component: ExamsPage })

const GRADES = [5, 6, 7, 8, 9, 10] as const
const FORMATS: Record<ExamFormat, { title: string; blurb: string }> = {
  cbse: { title: '🇮🇳 CBSE board style', blurb: 'Sections A–D: 1-mark objective questions, 2- and 3-mark questions, and 4–5-mark long answers.' },
  ib: { title: '🌍 IB MYP style', blurb: 'Questions grouped by criterion. You get a level (0–8) for each criterion and an approximate MYP grade.' },
}

const chip = (on: boolean) => cn('rounded-xl border-2 px-3 py-2 text-sm font-semibold transition', on ? 'border-brand bg-brand-soft' : 'hover:border-brand/50')
const pct = (e: number, t: number) => (t ? Math.round((100 * e) / t) : 0)

function ExamsPage() {
  const navigate = useNavigate()
  const learnerGrade = useProfile((s) => s.grade)
  const { active, history, start, discard } = useExams()
  const subjects = getSubjects()
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? 'physics')
  const [grade, setGrade] = useState<number>(learnerGrade ? effectiveGrade(learnerGrade, subjectId) : 9)
  const [format, setFormat] = useState<ExamFormat>('cbse')
  const [length, setLength] = useState<ExamLength>('standard')
  const units = useMemo(() => unitsForGrade(subjectId, grade), [subjectId, grade])
  const [picked, setPicked] = useState<string[] | null>(null)
  const chosen = picked ?? units.map((u) => u.id)
  const topicKeys = useMemo(() => examTopicKeys(subjectId, grade, chosen), [subjectId, grade, chosen])
  const status = usePracticeSets(topicKeys)
  const pool = useMemo(() => (status === 'ready' ? examPool(topicKeys) : []), [status, topicKeys])

  const chooseSubject = (id: string) => {
    setSubjectId(id)
    setPicked(null)
    if (learnerGrade) setGrade(effectiveGrade(learnerGrade as Grade, id))
  }
  const begin = () => {
    const paper = buildPaper(pool, format, length, Math.random())
    if (!paper.totalMarks) return
    const subject = getSubject(subjectId)!
    const now = Date.now()
    start({
      id: `e${now}`,
      subjectId,
      grade,
      title: `${subject.title}, Grade ${grade}`,
      paper,
      startedAt: now,
      deadline: now + paper.minutes * 60_000,
      responses: {},
      flagged: [],
    })
    void navigate({ to: '/exams/paper' })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="font-heading text-4xl font-bold">📝 Exam practice</h1>
        <p className="mt-1 text-lg text-muted-foreground">Timed papers built from your topics, marked like the real thing. No hints until you hand in.</p>
      </header>

      {active && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-brand bg-brand-soft p-4">
          <div>
            <p className="font-semibold">{active.submittedAt ? '✍️ Paper handed in: finish marking it' : '⏳ Paper in progress'}</p>
            <p className="text-sm text-muted-foreground">{active.title} · {LENGTHS[active.paper.length].label}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild><Link to="/exams/paper">Continue</Link></Button>
            <Button variant="outline" onClick={() => window.confirm('Discard this paper? Your answers will be lost.') && discard()}>Discard</Button>
          </div>
        </div>
      )}

      <section className="space-y-5 rounded-3xl border bg-card p-5">
        <div>
          <h2 className="font-heading text-lg font-semibold">1. Subject and grade</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {subjects.map((s) => <button key={s.id} type="button" aria-pressed={subjectId === s.id} onClick={() => chooseSubject(s.id)} className={chip(subjectId === s.id)}>{s.icon} {s.title}</button>)}
          </div>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Grade">
            {GRADES.map((g) => <button key={g} type="button" role="radio" aria-checked={grade === g} onClick={() => { setGrade(g); setPicked(null) }} className={chip(grade === g)}>Grade {g}</button>)}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold">2. Units</h2>
          {units.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No units for this grade yet.</p> : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {units.map((u) => {
                const on = chosen.includes(u.id)
                return (
                  <label key={u.id} className={cn('flex cursor-pointer items-start gap-2 rounded-xl border-2 p-3 text-sm', on ? 'border-brand/60' : 'opacity-70')}>
                    <input type="checkbox" className="mt-0.5 size-4" checked={on} onChange={() => setPicked(on ? chosen.filter((x) => x !== u.id) : [...chosen, u.id])} />
                    <span><b>Unit {u.number}:</b> {u.title}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold">3. Style and length</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(Object.keys(FORMATS) as ExamFormat[]).map((f) => (
              <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className={cn(chip(format === f), 'text-left')}>
                {FORMATS[f].title}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{FORMATS[f].blurb}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Length">
            {(Object.keys(LENGTHS) as ExamLength[]).map((l) => <button key={l} type="button" role="radio" aria-checked={length === l} onClick={() => setLength(l)} className={chip(length === l)}>{LENGTHS[l].label} · {LENGTHS[l].minutes} min</button>)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={begin} disabled={!!active || pool.length < 5}>Start the paper</Button>
          <p className="text-sm text-muted-foreground">
            {active ? 'Finish or discard the paper in progress first.' : status === 'loading' ? 'Loading questions…' : status === 'error' ? 'Couldn’t load the questions. Check your connection.' : pool.length < 5 ? 'Choose at least one unit.' : `${pool.length} questions to choose from. The timer starts straight away.`}
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold">Past papers</h2>
        {history.length === 0 ? <p className="mt-2 text-muted-foreground">Your results will appear here.</p> : (
          <ul className="mt-3 space-y-2">
            {history.map((h) => (
              <li key={h.id}>
                <Link to="/exams/result" search={{ id: h.id }} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 hover:bg-muted/50">
                  <span>
                    <b>{h.title}</b> <span className="text-sm text-muted-foreground">· {h.format === 'cbse' ? 'CBSE style' : 'IB style'} · {LENGTHS[h.length].label} · {h.date}</span>
                  </span>
                  <span className="font-heading text-lg font-bold tabular-nums">{h.earned}/{h.total} <span className="text-sm text-muted-foreground">({pct(h.earned, h.total)}%)</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
