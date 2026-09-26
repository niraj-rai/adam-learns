import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { WeekStrip } from '@/components/plan/StudyPlan'
import { Button } from '@/components/ui/button'
import { getSubjects, getTopicByKey, type Topic } from '@/content/loader'
import { Readout } from '@/labs/_kit/LabFrame'
import { BADGES } from '@/lib/badges'
import { levelFor } from '@/lib/levels'
import { effectiveGrade, gradeTopics, pendingWarmups, strength } from '@/lib/learner'
import { needsAttention, recentActivity, subjectSummary, timeSummary } from '@/lib/report'
import { formatDuration } from '@/lib/timeTracking'
import { DailyBars } from '@/components/progress/TimeSpent'
import { DAY_SHORT, TIMES, WEEK, activeInLast, formatMinutes, planSubjects, shiftIso, todayIso, weekAdherence, weeklyMinutes } from '@/lib/schedule'
import { STATUS_STYLE, topicStatus } from '@/lib/status'
import { cn } from '@/lib/utils'
import { useProfile } from '@/stores/profile'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { useTime } from '@/stores/time'

export const Route = createFileRoute('/report')({ component: ReportPage })

const pct = (x: number) => `${Math.round(x * 100)}%`
const niceDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Printed pages are always light, even when the site is in dark mode. */
function useLightPrint() {
  useEffect(() => {
    const root = document.documentElement
    let wasDark = false
    const before = () => { wasDark = root.classList.contains('dark'); root.classList.remove('dark') }
    const after = () => { if (wasDark) root.classList.add('dark') }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after) }
  }, [])
}

function Card({ title, hint, children, className }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 break-inside-avoid rounded-2xl border bg-card p-4 sm:p-5', className)}>
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function TopicLink({ t }: { t: Topic }) {
  return (
    <Link to="/$subject/$unit/$topic" params={{ subject: t.subjectId, unit: t.unitId, topic: t.id }} className="min-w-0 truncate hover:underline">
      {t.emoji} {t.title}
    </Link>
  )
}

function ReportPage() {
  useLightPrint()
  const { xp, topics, badges, activeDays, review } = useProgress()
  const { firstName, lastName, grade, check } = useProfile()
  const today = todayIso()
  const subjects = getSubjects()
  const level = levelFor(xp)
  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Learner'
  const last7 = activeInLast(activeDays, 7, today)
  const last30 = activeInLast(activeDays, 30, today)
  const masteredAll = Object.values(topics).filter((p) => p.masteredAt).length
  const due = dueReviewItems(review).length
  const warm = pendingWarmups(check, topics)
  const attention = needsAttention(topics, review, today).map((a) => ({ ...a, t: getTopicByKey(a.key) })).filter((a) => a.t).slice(0, 10)
  const recent = recentActivity(topics, 8).map((r) => ({ ...r, t: getTopicByKey(r.key) })).filter((r) => r.t)

  const perSubject = subjects.map((s) => {
    const list = grade ? gradeTopics(s.id, grade) : s.units.flatMap((u) => u.topics)
    const g = grade ? effectiveGrade(grade, s.id) : null
    return { s, g, sum: subjectSummary(list, topics) }
  })
  const timeAll = useTime()
  const time = timeSummary(timeAll, today, subjects.map((s) => s.id))
  const gradeMastered = perSubject.reduce((n, x) => n + x.sum.mastered, 0)
  const gradeTotal = perSubject.reduce((n, x) => n + x.sum.total, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-5 [print-color-adjust:exact] print:max-w-none print:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link to="/progress" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand"><ArrowLeft className="size-4" /> Back to Progress</Link>
        <Button size="lg" className="bg-brand text-white hover:bg-brand/90" onClick={() => window.print()}><Printer /> Print or save as PDF</Button>
      </div>

      <header className="rounded-3xl border-2 border-brand/30 bg-brand-soft/50 p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">📋 Progress report · for parents and students</p>
        <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl"><span className="font-hand text-brand">{name}</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">{grade ? `Grade ${grade}` : 'Grade not set'} · Report made on {niceDate(today)}</p>
        <p className="mt-3 text-base">
          {firstName || 'This learner'} studied on <b>{last7} of the last 7 days</b>{time.week > 0 ? <> (<b>{formatDuration(time.week)}</b> of active learning this week)</> : ''} and has mastered <b>{gradeMastered} of {gradeTotal}</b> {grade ? `Grade ${grade} ` : ''}topics so far{masteredAll > gradeMastered ? ` (${masteredAll} in all grades)` : ''}.
          {attention.length ? ` ${attention.length} ${attention.length === 1 ? 'topic is' : 'topics are'} worth another look.` : ' Nothing needs extra attention right now. 🎉'}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 print:grid-cols-6" aria-label="Overall">
        <Readout label="Level" value={<span className="text-base">{level.current.emoji} {level.current.name}</span>} className="bg-card" />
        <Readout label="XP" value={xp} className="bg-card" />
        <Readout label="Streak" value={`🔥 ${currentStreak(activeDays)} d`} className="bg-card" />
        <Readout label="Active, 7 days" value={`${last7} / 7`} className="bg-card" />
        <Readout label="Active, 30 days" value={`${last30} / 30`} className="bg-card" />
        <Readout label="Badges" value={`${badges.length} / ${Object.keys(BADGES).length}`} className="bg-card" />
      </section>

      <Card title="Subjects" hint={grade ? `Topics for Grade ${grade}. Mastered means 80% or more on practice.` : 'All topics. Mastered means 80% or more on practice.'}>
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {perSubject.map(({ s, g, sum }) => (
            <div key={s.id} data-subject={s.id} className="min-w-0 break-inside-avoid rounded-xl border p-3">
              <p className="flex flex-wrap items-baseline justify-between gap-x-2 font-semibold">
                <span>{s.icon} {s.title}</span>
                <span className="text-xs font-normal text-muted-foreground">{g && g !== grade ? `Grade ${g} topics for now` : ''}</span>
              </p>
              <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${sum.mastered} mastered, ${sum.started} started, ${sum.notStarted} not started`}>
                <div className="h-full bg-success" style={{ width: `${sum.total ? (sum.mastered / sum.total) * 100 : 0}%` }} />
                <div className="h-full bg-warn" style={{ width: `${sum.total ? (sum.started / sum.total) * 100 : 0}%` }} />
              </div>
              <dl className="mt-2 grid grid-cols-4 gap-1 text-center text-xs">
                <div><dt className="text-muted-foreground">Mastered</dt><dd className="font-heading text-lg font-semibold tabular-nums text-success">{sum.mastered}</dd></div>
                <div><dt className="text-muted-foreground">Started</dt><dd className="font-heading text-lg font-semibold tabular-nums">{sum.started}</dd></div>
                <div><dt className="text-muted-foreground">Not yet</dt><dd className="font-heading text-lg font-semibold tabular-nums text-muted-foreground">{sum.notStarted}</dd></div>
                <div><dt className="text-muted-foreground">Avg best</dt><dd className="font-heading text-lg font-semibold tabular-nums">{sum.avgBest === null ? '–' : pct(sum.avgBest)}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          <span><span className="mr-1 inline-block size-2.5 rounded-full bg-success align-middle" />Mastered</span>
          <span><span className="mr-1 inline-block size-2.5 rounded-full bg-warn align-middle" />Started</span>
          <span><span className="mr-1 inline-block size-2.5 rounded-full bg-muted align-middle" />Not started</span>
        </p>
      </Card>

      <Card title="⏱️ Time spent" hint="Active learning time on this device. It pauses when the page is hidden or after 2 minutes with no activity. This week runs Monday to Sunday.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2">
          <Readout label="Today" value={formatDuration(time.today)} />
          <Readout label="This week" value={formatDuration(time.week)} />
          <Readout label="All time" value={formatDuration(time.allTime)} />
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 print:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Last 14 days</p>
            <DailyBars time={timeAll} today={today} className="mt-2" />
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Time spent per subject</caption>
            <thead className="text-xs text-muted-foreground uppercase">
              <tr><th scope="col" className="pb-1 text-left font-semibold">Subject</th><th scope="col" className="pb-1 text-right font-semibold">This week</th><th scope="col" className="pb-1 text-right font-semibold">All time</th></tr>
            </thead>
            <tbody>
              {time.subjects.map(({ id, week, allTime }) => {
                const s = subjects.find((x) => x.id === id)!
                return (
                  <tr key={id} className="border-t">
                    <th scope="row" className="py-1 pr-2 text-left font-normal">{s.icon} {s.title}</th>
                    <td className="py-1 text-right tabular-nums">{week ? formatDuration(week) : '–'}</td>
                    <td className="py-1 text-right tabular-nums">{allTime ? formatDuration(allTime) : '–'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2">
        <Card title="Needs attention" hint="Practised but under 80%, or with review questions due.">
          {attention.length ? (
            <ul className="space-y-1.5 text-sm">
              {attention.map(({ key, t, bestScore, attempts, due: d, lowScore }) => (
                <li key={key} className="flex min-w-0 items-center justify-between gap-2">
                  <TopicLink t={t!} />
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{lowScore ? `best ${pct(bestScore)} · ${attempts} ${attempts === 1 ? 'try' : 'tries'}` : ''}{lowScore && d ? ' · ' : ''}{d ? `${d} to review` : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">✅ Nothing right now. Keep it up!</p>
          )}
          {due > 0 && <Link to="/review" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline print:hidden">🔁 {due} review {due === 1 ? 'question' : 'questions'} due: review now →</Link>}
        </Card>

        <Card title="Skills check and warm-ups" hint={check ? `Taken on ${niceDate(check.takenAt)}.` : undefined}>
          {check && Object.keys(check.results).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subjects.filter((s) => check.results[s.id]).map((s) => {
                const r = check.results[s.id]
                const st = strength(r)
                return <span key={s.id} className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', st.cls)}>{s.icon} {s.title}: {st.label} ({r.correct}/{r.total})</span>
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The skills check hasn't been taken yet. <Link to="/welcome" search={{ step: 'check' }} className="font-semibold text-brand hover:underline print:no-underline">Take it now</Link> to find useful warm-ups.</p>
          )}
          {warm.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-semibold">🔧 Warm-ups still to do ({warm.length})</p>
              <ul className="mt-1 space-y-1 text-sm">{warm.map((t) => <li key={t.key} className="flex min-w-0"><TopicLink t={t} /></li>)}</ul>
            </>
          ) : check ? (
            <p className="mt-3 text-sm">💪 All warm-ups done.</p>
          ) : null}
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2">
        <Card title="Recent activity" hint="Topics by when they were last studied.">
          {recent.length ? (
            <ul className="space-y-1.5 text-sm">
              {recent.map(({ key, t, p }) => {
                const st = STATUS_STYLE[topicStatus(p)]
                return (
                  <li key={key} className="flex min-w-0 items-center gap-2">
                    <span className="w-20 shrink-0 text-xs text-muted-foreground tabular-nums">{niceDate(p.lastSeen).replace(/ \d{4}$/, '')}</span>
                    <TopicLink t={t!} />
                    <span className={cn('ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', st.cls)}>{p.attempts ? pct(p.bestScore) : st.label}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No lessons yet. The first one is waiting on the home page!</p>
          )}
        </Card>

        <PlanCard activeDays={activeDays} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Made by AdamLearns from progress saved on this device. {grade ? `IB MYP first, mapped to CBSE Class ${grade}.` : ''} <Link to="/progress" className="underline print:hidden">See the full topic table</Link>
      </p>
    </div>
  )
}

function PlanCard({ activeDays }: { activeDays: string[] }) {
  const schedule = useProfile((s) => s.schedule)
  const today = todayIso()
  if (!schedule) {
    return (
      <Card title="Study plan">
        <p className="text-sm text-muted-foreground">No study plan yet. A simple weekly plan (days, time and subjects) helps build a habit.</p>
        <Link to="/welcome" search={{ step: 'schedule' }} className="mt-2 inline-block text-sm font-semibold text-brand hover:underline print:hidden">📅 Set up a study plan →</Link>
      </Card>
    )
  }
  const subjects = getSubjects()
  const ids = planSubjects(schedule, subjects.map((s) => s.id))
  const time = TIMES.find((t) => t.id === schedule.time)
  const weeks = [0, 1, 2, 3].map((w) => {
    const iso = w === 0 ? today : shiftIso(today, -7 * w)
    const a = weekAdherence(schedule, activeDays, iso)
    return { label: w === 0 ? 'This week' : w === 1 ? 'Last week' : `${w} weeks ago`, done: a.plannedDone, planned: w === 0 ? a.plannedSoFar : a.planned, total: a.planned, studied: a.studied }
  })
  return (
    <Card title="Study plan" hint={`${WEEK.filter((d) => schedule.days.includes(d)).map((d) => DAY_SHORT[d]).join(', ')} · ${schedule.minutes} min · ${time?.label.toLowerCase()} · goal ${formatMinutes(weeklyMinutes(schedule))} a week`}>
      <p className="text-sm">Focus: {ids.length === subjects.length ? 'all subjects' : ids.map((id) => subjects.find((s) => s.id === id)).map((s) => `${s?.icon} ${s?.title}`).join(', ')}</p>
      <WeekStrip schedule={schedule} activeDays={activeDays} className="mt-3 max-w-72" />
      <table className="mt-3 w-full text-sm">
        <caption className="sr-only">Planned study days kept, by week</caption>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.label} className="border-t first:border-t-0">
              <th scope="row" className="py-1 pr-2 text-left font-normal text-muted-foreground">{w.label}</th>
              <td className="py-1 text-right tabular-nums"><b>{w.done}</b> of {w.label === 'This week' ? `${w.planned} so far (${w.total} planned)` : w.planned} planned days{w.studied > w.done ? ` · +${w.studied - w.done} extra` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/welcome" search={{ step: 'schedule' }} className="mt-2 inline-block text-sm font-semibold text-brand hover:underline print:hidden">Edit plan →</Link>
    </Card>
  )
}
