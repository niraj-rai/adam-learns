import { Link } from '@tanstack/react-router'
import { ArrowRight, Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { getSubjects } from '@/content/loader'
import { nextForPlan } from '@/lib/learner'
import { LEADS, formatClock, leadFor, type DayReminder, type ReminderSettings } from '@/lib/reminders'
import { DAY_LONG, DAY_SHORT, MINUTES, TIMES, TIME_START, WEEK, dayOfWeek, formatMinutes, isClock, isStudyDay, nextStudyDay, planSubjects, timeOfDay, todayIso, weekAdherence, weeklyMinutes, type StudySchedule } from '@/lib/schedule'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import type { Grade, SkillsCheck } from '@/stores/profile'
import type { TopicProgress } from '@/stores/progress'
import { ReminderControls } from './Reminders'

const CHIP = 'rounded-xl border-2 px-3 py-2 text-sm font-semibold transition'
const chipState = (on: boolean) => (on ? 'border-brand bg-brand-soft' : 'hover:border-brand/50')

function Group({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="mt-5 min-w-0">
      <legend className="font-heading text-lg font-semibold">{legend}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
    </fieldset>
  )
}

/** The optional study-plan step of onboarding (also used to edit the plan later). */
export function StudyPlanStep({ name, initial, reminders: initialReminders, onSave, onSkip, onRemove }: { name: string; initial: StudySchedule | null; reminders: ReminderSettings; onSave: (s: StudySchedule, r: ReminderSettings) => void; onSkip: () => void; onRemove?: () => void }) {
  const subjects = getSubjects()
  const [days, setDays] = useState<number[]>(initial?.days ?? [1, 2, 3, 4, 5])
  const [start, setStart] = useState<string>(initial?.start ?? TIME_START.afternoon)
  const time = timeOfDay(start)
  const [minutes, setMinutes] = useState<number>(initial?.minutes ?? 30)
  const [reminders, setReminders] = useState<ReminderSettings>(initialReminders)
  const [dayReminders, setDayReminders] = useState<StudySchedule['dayReminders']>(initial?.dayReminders ?? {})
  const [picked, setPicked] = useState<string[]>(initial?.subjects.length ? initial.subjects : subjects.map((s) => s.id))
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x])
  const valid = days.length > 0 && picked.length > 0
  const presets: { label: string; days: number[] }[] = [
    { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
    { label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
    { label: 'Weekends', days: [0, 6] },
  ]

  return (
    <form
      className="rounded-3xl border-2 bg-card p-5 shadow-sm sm:p-8"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        // all subjects picked is stored as "all", so new subjects join the plan automatically
        const all = picked.length === subjects.length
        // overrides for days no longer in the plan are dropped when the plan is saved
        onSave({ days: [...days].sort(), time, start, minutes, subjects: all ? [] : picked, dayReminders, updatedAt: new Date().toISOString() }, reminders)
      }}
    >
      <p className="text-5xl">📅</p>
      <h1 className="mt-3 font-heading text-3xl font-bold">{initial ? 'Your study plan' : <>A study plan{name ? <>, <span className="font-hand text-4xl text-brand">{name}</span></> : null}?</>}</h1>
      <p className="mt-2 text-muted-foreground">Optional: pick the days and time that suit you. We'll show today's plan on your home page and how your week is going. You can change it any time.</p>

      <Group legend="Which days?">
        <div className="grid grid-cols-7 gap-1">
          {WEEK.map((d) => (
            <button key={d} type="button" aria-pressed={days.includes(d)} aria-label={DAY_LONG[d]} onClick={() => { setDays(toggle(days, d)); sfx.click() }} className={cn('rounded-xl border-2 py-2 text-xs font-semibold transition sm:text-sm', chipState(days.includes(d)))}>
              {DAY_SHORT[d]}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {presets.map((p) => (
            <button key={p.label} type="button" onClick={() => setDays(p.days)} className="font-semibold text-brand underline-offset-2 hover:underline">{p.label}</button>
          ))}
        </div>
      </Group>

      <Group legend="What time?" hint="Pick a time of day, then set the exact start if you like.">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Time of day">
          {TIMES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={time === t.id} onClick={() => setStart(TIME_START[t.id])} className={cn(CHIP, 'flex flex-col items-center gap-0.5 px-1', chipState(time === t.id))}>
              <span className="text-2xl" aria-hidden>{t.emoji}</span>
              <span className="text-xs sm:text-sm">{t.label}</span>
            </button>
          ))}
        </div>
        <label className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          Starts at
          <input type="time" step={300} required value={start} onChange={(e) => isClock(e.target.value) && setStart(e.target.value)} className="rounded-xl border-2 bg-background px-3 py-1.5 font-semibold tabular-nums focus-visible:border-brand focus-visible:outline-none" />
        </label>
      </Group>

      <Group legend="How long each time?">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Minutes per session">
          {MINUTES.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={minutes === m} onClick={() => setMinutes(m)} className={cn(CHIP, 'tabular-nums', chipState(minutes === m))}>{m} min</button>
          ))}
        </div>
      </Group>

      <Group legend="Which subjects?" hint="Pick the ones to focus on. All of them is fine too.">
        <div className="grid gap-2 sm:grid-cols-2">
          {subjects.map((s) => (
            <button key={s.id} type="button" aria-pressed={picked.includes(s.id)} onClick={() => setPicked(toggle(picked, s.id))} className={cn(CHIP, 'flex items-center justify-between gap-2 text-left', chipState(picked.includes(s.id)))}>
              <span>{s.icon} {s.title}</span>
              {picked.includes(s.id) && <Check className="size-4 shrink-0 text-brand" />}
            </button>
          ))}
        </div>
      </Group>

      <Group legend="Reminders" hint="A chime before each study session, and a sound when it's time to start.">
        <ReminderControls value={reminders} onChange={setReminders} />
        {reminders.on && days.length > 0 && (
          <details className="mt-3 rounded-xl border-2 px-3 py-2 text-sm">
            <summary className="cursor-pointer font-semibold">Change the reminder for one day</summary>
            <p className="mt-1 text-xs text-muted-foreground">Default is {reminders.lead} min before, as chosen above.</p>
            <ul className="mt-2 space-y-2">
              {WEEK.filter((d) => days.includes(d)).map((d) => (
                <li key={d} className="flex items-center justify-between gap-2">
                  <label htmlFor={`rem-${d}`} className="min-w-0">{DAY_LONG[d]}</label>
                  <select
                    id={`rem-${d}`}
                    value={String(dayReminders[d] ?? 'default')}
                    onChange={(e) => {
                      const v = e.target.value
                      const next = { ...dayReminders }
                      if (v === 'default') delete next[d]
                      else next[d] = (v === 'off' ? 'off' : Number(v)) as DayReminder
                      setDayReminders(next)
                    }}
                    className="max-w-[60%] min-w-0 rounded-lg border-2 bg-background px-2 py-1 text-sm"
                  >
                    <option value="default">Default</option>
                    {[...LEADS].reverse().map((m) => <option key={m} value={m}>{m} min before</option>)}
                    <option value="off">Off</option>
                  </select>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Group>

      <p className="mt-5 rounded-xl bg-brand-soft px-4 py-3 text-sm" aria-live="polite">
        {valid ? <>🎯 Weekly goal: <b>{days.length} {days.length === 1 ? 'day' : 'days'} × {minutes} min = {formatMinutes(days.length * minutes)}</b> a week. Little and often works best!</> : 'Pick at least one day and one subject to make a plan.'}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="lg" onClick={onSkip}>{initial ? 'Keep my old plan' : 'Skip for now'}</Button>
          {onRemove && <Button type="button" variant="ghost" size="lg" className="text-muted-foreground" onClick={onRemove}>Remove plan</Button>}
        </div>
        <Button type="submit" size="lg" disabled={!valid} className="bg-brand text-white hover:bg-brand/90">Save my plan <ArrowRight /></Button>
      </div>
    </form>
  )
}

/** Monday to Sunday: planned days are outlined, studied days are filled. */
export function WeekStrip({ schedule, activeDays, className }: { schedule: StudySchedule | null; activeDays: string[]; className?: string }) {
  const { days } = weekAdherence(schedule, activeDays, todayIso())
  return (
    <ol className={cn('grid grid-cols-7 gap-1', className)} aria-label="This week">
      {days.map((d) => (
        <li key={d.date} className="flex flex-col items-center gap-0.5">
          <span className={cn('text-[10px] font-semibold uppercase', d.isToday ? 'text-brand' : 'text-muted-foreground')}>{DAY_SHORT[d.dow].slice(0, 2)}</span>
          <span
            title={`${DAY_LONG[d.dow]} ${d.date}: ${d.planned ? 'study day' : 'rest day'}${d.active ? ', studied' : ''}`}
            aria-label={`${DAY_LONG[d.dow]}: ${d.planned ? 'study day' : 'rest day'}${d.active ? ', studied' : d.future ? '' : ', not studied'}`}
            className={cn('flex size-7 items-center justify-center rounded-full border-2 text-xs [print-color-adjust:exact]', d.active ? 'border-success bg-success text-white' : d.planned ? 'border-brand/60 border-dashed' : 'border-transparent bg-muted', d.isToday && 'ring-2 ring-brand ring-offset-1 ring-offset-card')}
          >
            {d.active ? '✓' : d.planned ? '' : '·'}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** Home page card: today's plan and this week so far, or a small prompt to make a plan. */
export function TodayPlan({ schedule, reminders, activeDays, topics, grade, check }: { schedule: StudySchedule | null; reminders?: ReminderSettings; activeDays: string[]; topics: Record<string, TopicProgress>; grade: Grade | null; check: SkillsCheck | null }) {
  if (!schedule) {
    return (
      <Link to="/welcome" search={{ step: 'schedule' }} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed p-4 text-sm transition hover:border-brand">
        <span className="min-w-0"><span aria-hidden>📅 </span><b>Want a study plan?</b> <span className="text-muted-foreground">Pick your days, time and subjects. It's optional.</span></span>
        <span className="font-semibold text-brand">Set one up →</span>
      </Link>
    )
  }
  const today = todayIso()
  const subjects = getSubjects()
  const ids = planSubjects(schedule, subjects.map((s) => s.id))
  const names = ids.map((id) => subjects.find((s) => s.id === id)).filter((s) => s !== undefined)
  const studyDay = isStudyDay(schedule, today)
  const doneToday = activeDays.includes(today)
  const week = weekAdherence(schedule, activeDays, today)
  const nextDay = nextStudyDay(schedule, today)
  const time = TIMES.find((t) => t.id === schedule.time)
  const lead = reminders ? leadFor(schedule, reminders, dayOfWeek(today)) : null
  const next = studyDay ? nextForPlan(ids, topics, grade, check) : undefined

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="today-plan">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-60">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 id="today-plan" className="font-heading text-lg font-semibold">📅 Today's plan</h2>
            <Link to="/welcome" search={{ step: 'schedule' }} className="text-xs font-semibold text-muted-foreground hover:text-brand hover:underline">Edit plan</Link>
          </div>
          {studyDay ? (
            <p className="mt-1 text-sm">
              <b>{schedule.minutes} min</b> · {names.length === subjects.length ? 'any subject' : names.map((s) => `${s.icon} ${s.title}`).join(', ')} · {time?.emoji} {formatClock(schedule.start)}
              {reminders && <span className="text-muted-foreground"> · {lead ? `🔔 ${lead} min before` : '🔕 no reminder'}</span>}
            </p>
          ) : (
            <p className="mt-1 text-sm">Rest day 🌿{nextDay && <span className="text-muted-foreground"> Next study day: {DAY_LONG[new Date(`${nextDay}T00:00:00Z`).getUTCDay()]}.</span>}</p>
          )}
          {studyDay && doneToday && <p className="mt-1 text-sm font-semibold text-success">✅ You've studied today. Nice work!</p>}
          {next && !doneToday && (
            <Link to="/$subject/$unit/$topic" params={{ subject: next.subjectId, unit: next.unitId, topic: next.id }} className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand hover:underline">
              <span className="truncate">Try: {next.emoji} {next.title}</span> <ArrowRight className="size-4 shrink-0" />
            </Link>
          )}
        </div>
        <div className="w-full max-w-64 sm:w-64">
          <WeekStrip schedule={schedule} activeDays={activeDays} />
          <p className="mt-1 text-center text-xs text-muted-foreground">This week: <b className="text-foreground tabular-nums">{week.plannedDone} of {week.planned}</b> planned days{week.studied > week.plannedDone ? ` (+${week.studied - week.plannedDone} extra)` : ''} · goal {formatMinutes(weeklyMinutes(schedule))}</p>
        </div>
      </div>
    </section>
  )
}
