import { Link, createFileRoute } from '@tanstack/react-router'
import { Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DailyBars } from '@/components/progress/TimeSpent'
import { Button } from '@/components/ui/button'
import { getSubject, getSubjects, getTopicByKey } from '@/content/loader'
import { levelFor } from '@/lib/levels'
import { shiftIso } from '@/lib/schedule'
import { decodeSnapshot, type Snapshot } from '@/lib/snapshot'
import { EMPTY_TIME, formatDuration } from '@/lib/timeTracking'

export const Route = createFileRoute('/parent')({ component: ParentPage })

const niceDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** Read-only view of a progress snapshot shared by a learner. Nothing here is saved on this device. */
function ParentPage() {
  const [state, setState] = useState<{ snap: Snapshot | null; done: boolean }>({ snap: null, done: false })
  useEffect(() => {
    const code = new URLSearchParams(window.location.hash.slice(1)).get('d') ?? ''
    void decodeSnapshot(code).then((snap) => setState({ snap, done: true }))
  }, [])
  if (!state.done) return <p className="py-12 text-center text-muted-foreground" role="status">Opening the snapshot…</p>
  if (!state.snap)
    return (
      <div className="mx-auto max-w-xl space-y-3 py-12 text-center">
        <p className="text-5xl">🔗</p>
        <h1 className="font-heading text-2xl font-bold">This link doesn't contain a progress snapshot</h1>
        <p className="text-muted-foreground">Ask your child to open <b>Progress → Progress report → Share with a parent</b> and send you a new link.</p>
        <Button asChild variant="outline"><Link to="/">Go to AdamLearns</Link></Button>
      </div>
    )
  return <SnapshotView s={state.snap} />
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function SnapshotView({ s }: { s: Snapshot }) {
  const level = levelFor(s.xp)
  const days = { ...EMPTY_TIME, days: Object.fromEntries(s.t.days.map((sec, i) => [shiftIso(s.d, i - 13), sec])) }
  const topicTitle = (key: string) => getTopicByKey(key)?.title ?? key
  const subjects = getSubjects().filter((x) => s.s[x.id])
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-3xl bg-brand p-6 text-white">
        <p className="text-sm opacity-90">Shared progress snapshot · {niceDate(s.d)}</p>
        <h1 className="mt-1 font-heading text-3xl font-bold">📊 {s.n}'s learning{s.g ? ` · Grade ${s.g}` : ''}</h1>
        <p className="mt-2 text-sm opacity-90">A read-only copy of {s.n}'s report on the day it was shared. Ask for a new link to see the latest. Nothing is saved on this device.</p>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Level" value={`${level.current.emoji} ${level.current.name}`} sub={`${s.xp} XP`} />
        <Tile label="Streak" value={`🔥 ${s.st}`} sub={`${s.ad} active days in the last 2 weeks`} />
        <Tile label="Badges" value={`🏅 ${s.b}`} />
        <Tile label="Review due" value={`${s.due}`} sub="questions to revisit" />
      </section>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="font-heading text-xl font-semibold">⏱️ Time spent learning</h2>
        <div className="grid grid-cols-3 gap-2">
          <Tile label="That day" value={formatDuration(s.t.to)} />
          <Tile label="That week" value={formatDuration(s.t.wk)} />
          <Tile label="All time" value={formatDuration(s.t.all)} />
        </div>
        <DailyBars time={days} today={s.d} />
      </section>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="font-heading text-xl font-semibold">Subjects{s.g ? ` (Grade ${s.g} topics)` : ''}</h2>
        {subjects.map((sub) => {
          const [mastered, started, total] = s.s[sub.id]
          const pct = total ? Math.round((100 * mastered) / total) : 0
          return (
            <div key={sub.id} className="space-y-1">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-semibold">{sub.icon} {sub.title}</span>
                <span className="text-muted-foreground">{mastered} of {total} mastered · {started} started{s.t.sub[sub.id] ? ` · ${formatDuration(s.t.sub[sub.id])} that week` : ''}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${sub.title}: ${pct}% mastered`}>
                <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border p-4">
          <h2 className="font-heading text-lg font-semibold">🔧 Needs attention</h2>
          {s.w.length ? <ul className="mt-2 list-inside list-disc text-sm">{s.w.map((k) => <li key={k}>{topicTitle(k)}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Nothing flagged. 🎉</p>}
        </section>
        <section className="rounded-2xl border p-4">
          <h2 className="font-heading text-lg font-semibold">✅ Recently mastered</h2>
          {s.r.length ? <ul className="mt-2 list-inside list-disc text-sm">{s.r.map((k) => <li key={k}>{topicTitle(k)}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No topics mastered yet.</p>}
        </section>
      </div>

      {s.ex.length > 0 && (
        <section className="rounded-2xl border p-4">
          <h2 className="font-heading text-lg font-semibold">📝 Latest practice exams</h2>
          <ul className="mt-2 divide-y text-sm">
            {s.ex.map(([sub, g, format, earned, total, date], i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
                <span>{getSubject(sub)?.icon} {getSubject(sub)?.title ?? sub}, Grade {g} · {format === 'cbse' ? 'CBSE style' : 'IB style'} · {niceDate(date)}</span>
                <b className="tabular-nums">{earned}/{total} ({total ? Math.round((100 * earned) / total) : 0}%)</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-muted/50 p-4 text-sm">
        <h2 className="font-heading text-lg font-semibold">💡 How you can help</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Short, regular sessions beat long ones: 20–30 minutes on most days.</li>
          <li>Ask {s.n} to teach you one thing they learnt this week.</li>
          <li>Praise effort and progress, not just scores.</li>
          <li>If a topic stays in “needs attention”, suggest the lab for it first, then practice.</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={() => window.print()}><Printer /> Print</Button>
        <Button variant="ghost" asChild><Link to="/">About AdamLearns</Link></Button>
      </div>
    </div>
  )
}
