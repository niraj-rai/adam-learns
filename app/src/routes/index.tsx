import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BoardTags, ComplexityStars } from '@/components/board/BoardTags'
import { InstallAppCard } from '@/components/layout/InstallApp'
import { TodayPlan } from '@/components/plan/StudyPlan'
import { Button } from '@/components/ui/button'
import { getAllTopics, getSubjects } from '@/content/loader'
import { LABS } from '@/labs/registry'
import { BADGES, type BadgeId } from '@/lib/badges'
import { levelFor } from '@/lib/levels'
import { gradeTopics, nextForLearner, pendingWarmups, stageForGrade, topicGrade } from '@/lib/learner'
import { useProfile } from '@/stores/profile'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { useTime } from '@/stores/time'
import { localDate } from '@/lib/dates'
import { formatDuration } from '@/lib/timeTracking'

export const Route = createFileRoute('/')({ component: Home })

const COMING = [
  { id: 'physics', title: 'Physics', emoji: '🧲', note: 'Forces, light, electricity' },
  { id: 'biology', title: 'Biology', emoji: '🌿', note: 'Cells, body, ecosystems' },
  { id: 'mathematics', title: 'Mathematics', emoji: '📐', note: 'Algebra, geometry, data' },
]

function Home() {
  const featured = useMemo(() => [...LABS].sort(() => 0.5 - Math.random()).slice(0, 3), [])
  const { xp, topics, activeDays, review, badges } = useProgress()
  const { firstName, grade, check, schedule, reminders } = useProfile()
  const { topic: next, warmup } = nextForLearner(topics, grade, check)
  const level = levelFor(xp)
  const mastered = getAllTopics().filter((t) => topics[t.key]?.masteredAt).length
  const due = dueReviewItems(review).length
  const todaySecs = useTime((s) => s.days[localDate()] ?? 0)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-brand p-7 text-white shadow-lg" style={{ backgroundImage: 'linear-gradient(135deg, var(--brand), color-mix(in oklch, var(--brand), black 25%))' }}>
          <p className="text-sm font-semibold tracking-wide text-white/80">
            <span className="uppercase">{greeting}, </span>
            {firstName ? <span className="font-hand text-3xl leading-none font-bold tracking-normal text-white normal-case">{firstName}<span className="ml-1">!</span></span> : <span className="uppercase">scientist!</span>}
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight font-bold sm:text-4xl">What will you discover today?</h1>
          {next ? (
            <div className="mt-6 rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-white/80 uppercase">{warmup ? '🔧 Warm-up' : topics[next.key] ? 'Continue' : 'Up next'} · {getSubjects().find((s) => s.id === next.subjectId)?.title}{warmup && ` · from Grade ${topicGrade(next)}`}</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {next.emoji} {next.title}
              </p>
              <p className="mt-1 text-sm text-white/85">{next.summary}</p>
              <Button asChild size="lg" className="mt-4 bg-white text-slate-900 hover:bg-white/90">
                <Link to="/$subject/$unit/$topic" params={{ subject: next.subjectId, unit: next.unitId, topic: next.id }}>
                  {topics[next.key] ? 'Keep going' : 'Start lesson'} <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="mt-6 text-lg">🏆 You have mastered everything available so far. New units are coming soon!</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat emoji={level.current.emoji} label="Level" value={level.current.name} sub={level.next ? `${level.next.xp - xp} XP to ${level.next.name}` : 'Top level!'} />
          <Stat emoji="🔥" label="Streak" value={`${currentStreak(activeDays)} days`} sub={todaySecs ? `⏱️ ${formatDuration(todaySecs)} today` : 'Learn a little every day'} />
          <Stat emoji="🎯" label="Mastered" value={`${mastered} topics`} sub="80%+ on practice" />
          <Link to="/review" className="block">
            <Stat emoji="🔁" label="Review" value={`${due} due`} sub={due ? 'Tap to review now' : 'All caught up'} highlight={due > 0} />
          </Link>
          <BadgesTile badges={badges} />
        </div>
      </section>

      <TodayPlan schedule={schedule} reminders={reminders} activeDays={activeDays} topics={topics} grade={grade} check={check} />

      {grade && <GradePlan />}

      <section>
        <h2 className="font-heading text-2xl font-semibold">Subjects</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {getSubjects().map((s) => {
            const all = s.units.flatMap((u) => u.topics)
            const done = all.filter((t) => topics[t.key]?.masteredAt).length
            return (
              <Link
                key={s.id}
                to="/$subject"
                params={{ subject: s.id }}
                data-subject={s.id}
                className="group rounded-2xl border-2 border-chem/40 bg-card p-5 transition hover:-translate-y-0.5 hover:border-chem hover:shadow-md"
              >
                <p className="text-4xl">{s.icon}</p>
                <p className="mt-2 font-heading text-xl font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.tagline}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-chem" style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {done}/{all.length} topics mastered
                </p>
              </Link>
            )
          })}
          {COMING.filter((c) => !getSubjects().some((s) => s.id === c.id)).map((c) => (
            <div key={c.title} className="rounded-2xl border-2 border-dashed bg-muted/30 p-5 opacity-80">
              <p className="text-4xl grayscale-[40%]">{c.emoji}</p>
              <p className="mt-2 font-heading text-xl font-semibold">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.note}</p>
              <p className="mt-3 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">Coming soon</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl font-semibold">Jump into a lab</h2>
          <Link to="/labs" className="text-sm font-semibold text-chem hover:underline">
            All labs →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => (
            <Link key={l.id} to="/labs/$labId" params={{ labId: l.id }} className="flex gap-3 rounded-2xl border bg-card p-4 transition hover:border-chem">
              <span className="text-3xl">{l.emoji}</span>
              <span>
                <span className="block font-heading font-semibold">{l.title}</span>
                <span className="text-sm text-muted-foreground">{l.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {next && (
        <section className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Where this fits</p>
          <p className="mt-1 font-heading text-lg font-semibold">
            {next.emoji} {next.title} <ComplexityStars value={next.complexity} />
          </p>
          <BoardTags topic={next} className="mt-2" />
        </section>
      )}

      <InstallAppCard />
    </div>
  )
}

function GradePlan() {
  const { grade, check } = useProfile()
  const topics = useProgress((s) => s.topics)
  if (!grade) return null
  const warm = pendingWarmups(check, topics)
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-heading text-2xl font-semibold">Your Grade {grade} path</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
          <Link to="/report" className="text-muted-foreground hover:text-brand hover:underline">📋 Progress report</Link>
          <Link to="/welcome" search={{ step: 'grade' }} className="text-muted-foreground hover:text-brand hover:underline">🎓 Change grade</Link>
          <Link to="/welcome" search={{ step: 'check' }} className="text-brand hover:underline">{check ? 'Retake skills check' : 'Take the skills check'} →</Link>
        </div>
      </div>
      {warm.length > 0 ? (
        <div className="mt-4 rounded-2xl border-2 border-brand/40 bg-brand-soft/60 p-4">
          <p className="font-heading font-semibold">🔧 Warm-ups first ({warm.length} left)</p>
          <p className="text-sm text-muted-foreground">Basics from earlier grades that your Grade {grade} topics build on. Master each one (80%+ on practice) to tick it off.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {warm.map((t) => (
              <Link key={t.key} to="/$subject/$unit/$topic" params={{ subject: t.subjectId, unit: t.unitId, topic: t.id }} data-subject={t.subjectId} className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 transition hover:border-chem">
                <span className="text-2xl">{t.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{getSubjects().find((s) => s.id === t.subjectId)?.icon} Grade {topicGrade(t)}{topics[t.key] ? ` · best ${Math.round((topics[t.key].bestScore ?? 0) * 100)}%` : ''}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : !check ? (
        <p className="mt-3 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">🧭 Take the 5-minute skills check to find any basics from earlier grades worth a warm-up. Or just dive in: earlier-grade topics are always open in each subject.</p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {getSubjects().map((s) => {
          const list = gradeTopics(s.id, grade)
          const done = list.filter((t) => topics[t.key]?.masteredAt).length
          const g = list[0] ? topicGrade(list[0]) : grade
          const nextT = list.find((t) => !topics[t.key]?.masteredAt)
          return (
            <Link key={s.id} to="/$subject" params={{ subject: s.id }} onClick={() => { try { localStorage.setItem(`adamlearns-stage-${s.id}`, stageForGrade(g)) } catch { /* ignore */ } }} data-subject={s.id} className="min-w-0 rounded-2xl border bg-card p-4 transition hover:border-chem">
              <p className="flex items-center justify-between font-semibold"><span>{s.icon} {s.title}</span><span className="text-xs tabular-nums text-muted-foreground">{done}/{list.length}</span></p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-chem" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} /></div>
              <p className="mt-2 truncate text-xs text-muted-foreground">{g !== grade ? `Grade ${grade} coming soon · Grade ${g} for now` : nextT ? `Next: ${nextT.emoji} ${nextT.title}` : '🏆 All mastered!'}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function Stat({ emoji, label, value, sub, highlight }: { emoji: string; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`h-full rounded-2xl border bg-card p-4 ${highlight ? 'border-destructive/50' : ''}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        {emoji} {label}
      </p>
      <p className="mt-1 font-heading text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

const CHIP = 36 // badge chip width + gap, in px

/** Recently earned badge icons, as many as fit on two rows, with a "+K more" chip. */
function BadgesTile({ badges }: { badges: BadgeId[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const [perRow, setPerRow] = useState(6)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setPerRow(Math.max(3, Math.floor((el.clientWidth + 4) / CHIP)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [badges.length])
  const total = Object.keys(BADGES).length
  const recent = [...badges].reverse().filter((id) => BADGES[id])
  const room = perRow * 2
  const shown = recent.length > room ? recent.slice(0, room - 1) : recent
  const more = recent.length - shown.length
  return (
    <Link to="/progress" hash="badges" className="col-span-2 block min-w-0 rounded-2xl border bg-card p-4 transition hover:border-chem">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">🏅 Badges</p>
        <p className="text-xs text-muted-foreground"><b className="text-foreground tabular-nums">{badges.length}</b> earned of {total}</p>
      </div>
      {recent.length ? (
        <ul ref={ref} className="mt-2 flex flex-wrap gap-1" aria-label="Recent badges">
          {shown.map((id) => (
            <li key={id} role="img" aria-label={BADGES[id].title} title={BADGES[id].title} className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-xl dark:bg-amber-950/40">{BADGES[id].emoji}</li>
          ))}
          {more > 0 && <li className="flex size-8 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold tabular-nums" title={`${more} more`} aria-label={`and ${more} more`}>+{more}</li>}
        </ul>
      ) : (
        <p className="mt-1 text-sm">Finish your first lesson to earn a badge! 🌟</p>
      )}
      {recent.length > 0 && <p className="mt-2 text-xs font-semibold text-chem">See them all →</p>}
    </Link>
  )
}
