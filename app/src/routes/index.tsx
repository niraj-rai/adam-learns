import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { BoardTags, ComplexityStars } from '@/components/board/BoardTags'
import { Button } from '@/components/ui/button'
import { getAllTopics, getSubjects } from '@/content/loader'
import { LABS } from '@/labs/registry'
import { levelFor } from '@/lib/levels'
import { nextRecommended } from '@/lib/status'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'

export const Route = createFileRoute('/')({ component: Home })

const COMING = [
  { id: 'physics', title: 'Physics', emoji: '🧲', note: 'Forces, light, electricity' },
  { id: 'biology', title: 'Biology', emoji: '🌿', note: 'Cells, body, ecosystems' },
  { id: 'mathematics', title: 'Mathematics', emoji: '📐', note: 'Algebra, geometry, data' },
]

function Home() {
  const featured = useMemo(() => [...LABS].sort(() => 0.5 - Math.random()).slice(0, 3), [])
  const { xp, topics, activeDays, review, badges } = useProgress()
  const next = nextRecommended(topics)
  const level = levelFor(xp)
  const mastered = getAllTopics().filter((t) => topics[t.key]?.masteredAt).length
  const due = dueReviewItems(review).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div data-subject={next?.subjectId} className="rounded-3xl bg-chem p-7 text-white shadow-lg" style={{ backgroundImage: 'linear-gradient(135deg, var(--chem), color-mix(in oklch, var(--chem), black 25%))' }}>
          <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">{greeting}, scientist!</p>
          <h1 className="mt-2 font-heading text-3xl leading-tight font-bold sm:text-4xl">What will you discover today?</h1>
          {next ? (
            <div className="mt-6 rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-white/80 uppercase">{topics[next.key] ? 'Continue' : 'Up next'} · {getSubjects().find((s) => s.id === next.subjectId)?.title}</p>
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
          <Stat emoji="🔥" label="Streak" value={`${currentStreak(activeDays)} days`} sub="Learn a little every day" />
          <Stat emoji="🎯" label="Mastered" value={`${mastered} topics`} sub="80%+ on practice" />
          <Link to="/review" className="block">
            <Stat emoji="🔁" label="Review" value={`${due} due`} sub={due ? 'Tap to review now' : 'All caught up'} highlight={due > 0} />
          </Link>
          <Link to="/progress" className="col-span-2 block rounded-2xl border bg-card p-4 transition hover:border-chem">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Badges</p>
            <p className="mt-1 text-sm">{badges.length ? `${badges.length} earned. See them all →` : 'Finish your first lesson to earn a badge!'}</p>
          </Link>
        </div>
      </section>

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
    </div>
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
