import { Link } from '@tanstack/react-router'
import { getSubjects, getTopicByKey } from '@/content/loader'
import { getLab } from '@/labs/registry'
import { localDate } from '@/lib/dates'
import { DAY_SHORT, dayOfWeek } from '@/lib/schedule'
import { dailySeries, formatDuration, secondsOn, topEntries, weekSeconds, type TimeData } from '@/lib/timeTracking'
import { cn } from '@/lib/utils'

const niceDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Minutes per day as a bar chart, oldest on the left; today is highlighted. */
export function DailyBars({ time, today, days = 14, className }: { time: TimeData; today: string; days?: number; className?: string }) {
  const series = dailySeries(time, today, days)
  const max = Math.max(...series.map((x) => x.seconds), 60)
  const summary = series.map((x) => `${niceDay(x.date)}: ${formatDuration(x.seconds)}`).join('; ')
  return (
    <div className={className}>
      <div className="flex h-28 items-end gap-1 border-b" role="img" aria-label={`Time spent each day, last ${days} days. ${summary}`}>
        {series.map((x) => (
          <div key={x.date} className="flex h-full min-w-0 flex-1 items-end" title={`${niceDay(x.date)}: ${formatDuration(x.seconds)}`}>
            <div className={cn('w-full rounded-t', !x.seconds ? 'bg-muted' : x.date === today ? 'bg-brand' : 'bg-chem')} style={{ height: `${Math.max(3, (x.seconds / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-center text-[10px] text-muted-foreground" aria-hidden>
        {series.map((x) => (
          <span key={x.date} className={cn('min-w-0 flex-1', x.date === today && 'font-bold text-foreground')}>{DAY_SHORT[dayOfWeek(x.date)][0]}</span>
        ))}
      </div>
    </div>
  )
}

/** One bar per subject in its own colour, scaled to the biggest. */
export function SubjectTimeBars({ seconds, className }: { seconds: Record<string, number>; className?: string }) {
  const subjects = getSubjects()
  const max = Math.max(...subjects.map((s) => seconds[s.id] ?? 0), 1)
  return (
    <ul className={cn('space-y-2', className)}>
      {subjects.map((s) => {
        const v = seconds[s.id] ?? 0
        return (
          <li key={s.id} data-subject={s.id} className="text-sm">
            <p className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">{s.icon} {s.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDuration(v)}</span>
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${s.title}: ${formatDuration(v)}`}>
              <div className="h-full rounded-full bg-chem" style={{ width: `${(v / max) * 100}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border px-3 py-2">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-heading text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

/** The "Time spent" card on the Progress page. */
export function TimeSpentCard({ time }: { time: TimeData }) {
  const today = localDate()
  const labs = topEntries(time.labs, 5).map((x) => ({ ...x, lab: getLab(x.key) })).filter((x) => x.lab)
  const topics = topEntries(time.topics, 5).map((x) => ({ ...x, t: getTopicByKey(x.key) })).filter((x) => x.t)
  const other = Object.values(time.other).reduce((a, b) => a + b, 0)
  return (
    <section className="rounded-2xl border bg-card p-5" aria-labelledby="time-spent">
      <h2 id="time-spent" className="font-heading text-2xl font-semibold">⏱️ Time spent</h2>
      <p className="text-sm text-muted-foreground">Active learning time: it pauses after 2 minutes with no clicks, taps, typing or scrolling, and when this tab is hidden.</p>
      <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2">
        <Stat label="Today" value={formatDuration(secondsOn(time, today))} />
        <Stat label="This week" value={formatDuration(weekSeconds(time, today))} />
        <Stat label="All time" value={formatDuration(time.total)} />
      </div>
      {time.total === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No time recorded yet. Open a lesson or a lab and it starts adding up here.</p>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Last 14 days</h3>
            <DailyBars time={time} today={today} className="mt-2" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">By subject, all time</h3>
            <SubjectTimeBars seconds={time.subjects} className="mt-2" />
            {other > 0 && <p className="mt-2 text-xs text-muted-foreground">Plus {formatDuration(other)} on other pages (home, review, progress…).</p>}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Most-studied topics</h3>
            {topics.length ? (
              <ol className="mt-2 space-y-1.5 text-sm">
                {topics.map(({ key, seconds, t }) => (
                  <li key={key} data-subject={t!.subjectId} className="flex min-w-0 items-center justify-between gap-2">
                    <Link to="/$subject/$unit/$topic" params={{ subject: t!.subjectId, unit: t!.unitId, topic: t!.id }} className="min-w-0 truncate hover:underline">{t!.emoji} {t!.title}</Link>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDuration(seconds)}{time.practice[key] ? ` · ${formatDuration(time.practice[key])} practice` : ''}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No lessons yet.</p>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Top labs</h3>
            {labs.length ? (
              <ol className="mt-2 space-y-1.5 text-sm">
                {labs.map(({ key, seconds, lab }) => (
                  <li key={key} data-subject={lab!.subject} className="flex min-w-0 items-center justify-between gap-2">
                    <Link to="/labs/$labId" params={{ labId: key }} className="min-w-0 truncate hover:underline">{lab!.emoji} {lab!.title}</Link>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDuration(seconds)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No labs yet. <Link to="/labs" className="font-semibold text-brand hover:underline">Try one →</Link></p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
