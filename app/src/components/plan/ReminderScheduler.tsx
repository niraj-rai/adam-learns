import { Link } from '@tanstack/react-router'
import { ArrowRight, X } from 'lucide-react'
import { useEffect } from 'react'
import { create } from 'zustand'
import { Button } from '@/components/ui/button'
import { getSubjects, type Topic } from '@/content/loader'
import { localDate } from '@/lib/dates'
import { nextForPlan } from '@/lib/learner'
import { dueReminders, formatClock, pruneFired, type DueReminder } from '@/lib/reminders'
import { planSubjects, type StudySchedule } from '@/lib/schedule'
import { sfx } from '@/lib/sound'
import { useProfile } from '@/stores/profile'
import { useProgress } from '@/stores/progress'
import { useToasts } from '@/stores/toasts'

const FIRED_KEY = 'adamlearns-reminders-fired'
const CHECK_EVERY_MS = 30_000

/** Keys of reminders already played (date|start|kind), so a reload doesn't play them again. */
function readFired(): Set<string> {
  try {
    const x: unknown = JSON.parse(localStorage.getItem(FIRED_KEY) ?? '[]')
    return new Set(Array.isArray(x) ? x.filter((k): k is string => typeof k === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeFired(keys: string[]) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(keys))
  } catch {
    // storage is optional: at worst a reminder repeats after a reload
  }
}

/** "Maths", "Maths & Physics", or "Study" when the plan covers more. */
function sessionName(s: StudySchedule): string {
  const subjects = getSubjects()
  const ids = planSubjects(s, subjects.map((x) => x.id))
  if (ids.length === subjects.length || ids.length > 2) return 'Study'
  return ids.map((id) => subjects.find((x) => x.id === id)?.title ?? id).join(' & ')
}

/** A system notification, when allowed and the tab is out of sight (the toast covers the visible case). */
function notify(title: string, body: string, tag: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || document.visibilityState === 'visible') return
  try {
    const n = new Notification(title, { body, tag, icon: `${import.meta.env.BASE_URL}favicon.svg` })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    // some mobile browsers only allow notifications from a service worker: the toast and sound still work
  }
}

type StartPrompt = { title: string; body: string; topic?: Topic }

/** The open "Time to start" prompt. Kept in a store, not component state, so a remount doesn't lose it. */
const useStartPrompt = create<{ prompt: StartPrompt | null }>(() => ({ prompt: null }))
const setPrompt = (prompt: StartPrompt | null) => useStartPrompt.setState({ prompt })

/**
 * Plays study-plan reminders while the site is open. Every 30 seconds (and when the tab comes back into view)
 * it asks `dueReminders` what is due, records it as fired, then plays a chime, shows a toast and, if allowed,
 * a notification. At the start time it shows a "Time to start" prompt linking to what to study next.
 */
export function ReminderScheduler() {
  const prompt = useStartPrompt((s) => s.prompt)

  useEffect(() => {
    const check = () => {
      const { schedule, reminders, grade, check: skills } = useProfile.getState()
      const now = new Date()
      const fired = readFired()
      const due = dueReminders(schedule, reminders, now, fired)
      if (!schedule || !due.length) return
      // record first, so a second open tab reading the same record doesn't play them again
      writeFired(pruneFired([...fired, ...due.map((d) => d.key)], localDate(now)))
      const name = sessionName(schedule)
      for (const d of due) fire(d, name, schedule, reminders.sound)
      const start = due.find((d) => d.kind === 'start')
      if (start) {
        const ids = planSubjects(schedule, getSubjects().map((s) => s.id))
        const topic = nextForPlan(ids, useProgress.getState().topics, grade, skills)
        setPrompt({ title: `Time to start: ${name === 'Study' ? 'study time' : name}!`, body: `${schedule.minutes} min session, starting ${formatClock(start.start)}.`, topic })
      }
    }
    const fire = (d: DueReminder, name: string, s: StudySchedule, sound: boolean) => {
      if (d.kind === 'reminder') {
        const title = `⏰ ${name} session starts in ${d.minutesLeft} ${d.minutesLeft === 1 ? 'minute' : 'minutes'}`
        const body = `At ${formatClock(d.start)}, for ${s.minutes} min. Time to get ready!`
        if (sound) sfx.chime()
        useToasts.getState().push({ kind: 'reminder', title, body })
        notify(title, body, d.key)
      } else {
        if (sound) sfx.start()
        notify(`🔔 Time to start: ${name === 'Study' ? 'study time' : name}`, `Your ${s.minutes} min session starts now.`, d.key)
      }
    }
    check()
    const id = window.setInterval(check, CHECK_EVERY_MS)
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (!prompt) return null
  const close = () => setPrompt(null)
  return (
    <div role="alert" className="fixed inset-x-4 top-20 z-50 mx-auto max-w-md rounded-2xl border-2 border-brand bg-card p-4 shadow-xl print:hidden">
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden>🔔</span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-bold">{prompt.title}</p>
          <p className="text-sm text-muted-foreground">{prompt.body}</p>
        </div>
        <button type="button" onClick={close} aria-label="Close" className="-m-1 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-5" /></button>
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={close}>Later</Button>
        {prompt.topic ? (
          <Button asChild className="max-w-full bg-brand text-white hover:bg-brand/90">
            <Link to="/$subject/$unit/$topic" params={{ subject: prompt.topic.subjectId, unit: prompt.topic.unitId, topic: prompt.topic.id }} onClick={close}>
              <span className="truncate">Start: {prompt.topic.emoji} {prompt.topic.title}</span> <ArrowRight />
            </Link>
          </Button>
        ) : (
          <Button asChild className="bg-brand text-white hover:bg-brand/90"><Link to="/" onClick={close}>Let's go <ArrowRight /></Link></Button>
        )}
      </div>
    </div>
  )
}
