import { Link, createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getSubjects } from '@/content/loader'
import { BADGES, type BadgeId } from '@/lib/badges'
import { LEVELS, levelFor } from '@/lib/levels'
import { STATUS_STYLE, topicStatus } from '@/lib/status'
import { cn } from '@/lib/utils'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { strength } from '@/lib/learner'
import { useProfile } from '@/stores/profile'

export const Route = createFileRoute('/progress')({ component: ProgressPage })

function ProgressPage() {
  const state = useProgress()
  const { xp, badges, topics, activeDays, review, reset, importState } = state
  const level = levelFor(xp)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const profile = useProfile()
  const exportData = () => {
    const { xp, topics, badges, activeDays, predictions, labsTried, review, labMilestones } = useProgress.getState()
    const { firstName, lastName, grade, onboardedAt, check } = useProfile.getState()
    const blob = new Blob([JSON.stringify({ xp, topics, badges, activeDays, predictions, labsTried, review, labMilestones, profile: { firstName, lastName, grade, onboardedAt, check } }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `adamlearns-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10)
    return { d, active: activeDays.includes(d) }
  })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-4xl font-bold">📈 {profile.firstName ? <>{profile.firstName}'s Progress</> : 'My Progress'}</h1>
      </header>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Profile</p>
            <p className="mt-1 font-heading text-2xl font-bold">{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Learner'}</p>
            <p className="text-sm text-muted-foreground">{profile.grade ? `Grade ${profile.grade}` : 'Grade not set'}{profile.check ? ` · Skills check on ${profile.check.takenAt.slice(0, 10)}` : ' · Skills check not taken'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/welcome">Edit name</Link></Button>
            <Button asChild variant="outline"><Link to="/welcome" search={{ step: 'grade' }}>🎓 Change grade</Link></Button>
            <Button asChild className="bg-brand text-white hover:bg-brand/90"><Link to="/welcome" search={{ step: 'check' }}>{profile.check ? 'Retake skills check' : 'Take skills check'}</Link></Button>
          </div>
        </div>
        {profile.check && Object.keys(profile.check.results).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {getSubjects().filter((s) => profile.check!.results[s.id]).map((s) => {
              const r = profile.check!.results[s.id]
              const st = strength(r)
              return <span key={s.id} className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', st.cls)}>{s.icon} {s.title}: {st.label} ({r.correct}/{r.total})</span>
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 md:col-span-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Level</p>
          <p className="mt-1 font-heading text-3xl font-bold">
            {level.current.emoji} {level.current.name}
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-chem" style={{ width: `${level.progress * 100}%` }} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{level.next ? `${xp} XP · ${level.next.xp - xp} XP to ${level.next.name}` : `${xp} XP · Top level reached!`}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LEVELS.map((l, i) => (
              <span key={l.name} className={cn('rounded-full border px-2.5 py-1 text-xs', i <= level.index ? 'border-chem bg-chem-soft font-semibold' : 'opacity-50')}>
                {l.emoji} {l.name} · {l.xp}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Last 14 days</p>
          <p className="mt-1 font-heading text-3xl font-bold">🔥 {currentStreak(activeDays)}-day streak</p>
          <div className="mt-3 flex gap-1">
            {last14.map((x) => (
              <span key={x.d} title={x.d} className={cn('h-6 flex-1 rounded', x.active ? 'bg-orange-400' : 'bg-muted')} />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{dueReviewItems(review).length} review question(s) due</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold">Badges</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(BADGES) as BadgeId[]).map((id) => {
            const b = BADGES[id]
            const earned = badges.includes(id)
            return (
              <div key={id} className={cn('rounded-2xl border p-4 text-center', earned ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40' : 'opacity-50 grayscale')}>
                <p className="text-4xl">{b.emoji}</p>
                <p className="mt-1 font-heading font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold">For parents: topic report</h2>
        <p className="text-sm text-muted-foreground">Best practice score, attempts and when each topic was last studied. Mastery = 80%+.</p>
        {getSubjects().map((s) => (
          <div key={s.id} className="mt-3 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2">Topic</th>
                  <th className="px-4 py-2">IB</th>
                  <th className="px-4 py-2">CBSE</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Best</th>
                  <th className="px-4 py-2">Tries</th>
                  <th className="px-4 py-2">Last studied</th>
                </tr>
              </thead>
              <tbody>
                {s.units.flatMap((u) =>
                  u.topics.map((t) => {
                    const p = topics[t.key]
                    const st = topicStatus(p)
                    return (
                      <tr key={t.key} className="border-t">
                        <td className="px-4 py-2">
                          <Link to="/$subject/$unit/$topic" params={{ subject: t.subjectId, unit: t.unitId, topic: t.id }} className="hover:underline">
                            {t.number} {t.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          {t.grades.ib.programme} {t.grades.ib.year}
                        </td>
                        <td className="px-4 py-2">{t.grades.cbse.map((c) => c.class).join(', ')}</td>
                        <td className="px-4 py-2">
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_STYLE[st].cls)}>{STATUS_STYLE[st].label}</span>
                        </td>
                        <td className="px-4 py-2 tabular-nums">{p?.attempts ? `${Math.round(p.bestScore * 100)}%` : '—'}</td>
                        <td className="px-4 py-2 tabular-nums">{p?.attempts ?? 0}</td>
                        <td className="px-4 py-2 tabular-nums">{p?.lastSeen ?? '—'}</td>
                      </tr>
                    )
                  }),
                )}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Backup &amp; move devices</h2>
        <p className="text-sm text-muted-foreground">Progress is stored in this browser. Export it to keep a backup, or to move it to a tablet.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            Export progress
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Import progress
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const text = await f.text()
              const ok = importState(text)
              if (ok) {
                const p = JSON.parse(text).profile
                if (p && typeof p.firstName === 'string') useProfile.setState({ firstName: p.firstName, lastName: p.lastName ?? '', grade: p.grade ?? null, onboardedAt: p.onboardedAt ?? null, check: p.check ?? null })
              }
              setMsg(ok ? '✅ Progress imported.' : '❌ That file does not look like a progress export.')
              e.target.value = ''
            }}
          />
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm('Reset ALL progress (XP, badges, scores)? This cannot be undone. Export first if unsure.')) {
                reset()
                setMsg('Progress reset.')
              }
            }}
          >
            Reset progress
          </Button>
        </div>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </section>
    </div>
  )
}
