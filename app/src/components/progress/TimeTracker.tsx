import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { getSubject } from '@/content/loader'
import { getLab } from '@/labs/registry'
import { localDate } from '@/lib/dates'
import { appSegments } from '@/lib/path'
import { HEARTBEAT_MS, IDLE_MS, PERSIST_MS, contextFor, newClock, tick, touch, type Clock, type TimeContext } from '@/lib/timeTracking'
import { useTime, type TimeCredit } from '@/stores/time'

const ACTIVITY = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'] as const

const toContext = (pathname: string) => contextFor(appSegments(pathname), (id) => getLab(id)?.subject, (id) => Boolean(getSubject(id)))

/**
 * Counts active time in this tab. A heartbeat credits the active time since the last one
 * (see lib/timeTracking); seconds wait in memory and are written about once a minute,
 * and straight away when the page is hidden or closed. Returns a stop function.
 */
function startTracking() {
  let ctx: TimeContext = { other: 'home' }
  let clock: Clock = newClock(Date.now(), document.visibilityState === 'visible')
  if (!document.hasFocus()) clock = { ...clock, blurredAt: Date.now() }
  let lastPersist = Date.now()
  // milliseconds not yet written, per context and day
  const pending = new Map<string, { ctx: TimeContext; date: string; ms: number }>()

  // credit the time so far to the current page
  const beat = () => {
    const now = Date.now()
    const r = tick(clock, now)
    clock = r.clock
    if (r.ms <= 0) return
    const date = localDate(new Date(now))
    const key = `${date}|${JSON.stringify(ctx)}`
    const p = pending.get(key)
    if (p) p.ms += r.ms
    else pending.set(key, { ctx, date, ms: r.ms })
  }
  // …and write the whole seconds to storage
  const flush = () => {
    beat()
    lastPersist = Date.now()
    const credits: TimeCredit[] = []
    for (const [key, p] of pending) {
      const seconds = Math.floor(p.ms / 1000)
      if (seconds) credits.push({ ctx: p.ctx, date: p.date, seconds })
      p.ms -= seconds * 1000
      if (p.ms <= 0) pending.delete(key)
    }
    useTime.getState().addCredits(credits)
  }

  const onActivity = () => {
    const now = Date.now()
    // back from idle: credit up to the idle limit first, then start counting again
    if (now - clock.lastActivity > IDLE_MS) beat()
    clock = touch(clock, now)
  }
  const onVisibility = () => {
    if (document.visibilityState !== 'visible') {
      flush()
      clock = { ...clock, visible: false }
    } else {
      beat() // moves the clock past the hidden stretch without crediting it
      clock = touch({ ...clock, visible: true }, Date.now())
    }
  }
  const onBlur = () => {
    beat()
    clock = { ...clock, blurredAt: Date.now() }
  }
  const onFocus = () => {
    beat()
    clock = touch({ ...clock, blurredAt: null }, Date.now())
  }
  // another tab wrote time: reload it, so this tab doesn't overwrite it on its next write
  const onStorage = (e: StorageEvent) => {
    if (e.key === useTime.persist.getOptions().name) void useTime.persist.rehydrate()
  }

  const id = window.setInterval(() => (Date.now() - lastPersist >= PERSIST_MS ? flush() : beat()), HEARTBEAT_MS)
  for (const e of ACTIVITY) window.addEventListener(e, onActivity, { capture: true, passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('blur', onBlur)
  window.addEventListener('focus', onFocus)
  window.addEventListener('pagehide', flush)
  window.addEventListener('storage', onStorage)

  return {
    /** a new page: the time so far belongs to the old one */
    setContext(next: TimeContext) {
      if (JSON.stringify(next) === JSON.stringify(ctx)) return
      beat()
      ctx = next
    },
    stop() {
      window.clearInterval(id)
      for (const e of ACTIVITY) window.removeEventListener(e, onActivity, { capture: true })
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('storage', onStorage)
      flush()
    },
  }
}

/** Counts active learning time for the current page. Renders nothing. */
export function TimeTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const tracker = useRef<ReturnType<typeof startTracking> | null>(null)

  useEffect(() => {
    const t = startTracking()
    tracker.current = t
    return () => {
      t.stop()
      tracker.current = null
    }
  }, [])

  // runs after the effect above on mount, so the first page is set too
  useEffect(() => {
    tracker.current?.setContext(toContext(pathname))
  }, [pathname])

  return null
}
