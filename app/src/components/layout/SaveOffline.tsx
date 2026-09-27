import { useState } from 'react'
import { getAllTopics, loadPractice } from '@/content/loader'

// The same component modules the lab registry loads, so fetching them here fills the same cache entries.
const labModules = import.meta.glob('../../labs/*/*/[A-Z]*.tsx')

type State = { phase: 'idle' | 'saving' | 'done' | 'error'; done: number; total: number }

/** Runs tasks a few at a time, reporting progress; resolves with how many failed. */
async function runAll(tasks: (() => Promise<unknown>)[], onStep: (done: number) => void) {
  let done = 0
  let failed = 0
  const queue = [...tasks]
  const worker = async () => {
    for (let t = queue.shift(); t; t = queue.shift()) {
      await t().catch(() => failed++)
      onStep(++done)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  return failed
}

/**
 * Lessons, practice sets and labs are cached the first time each is opened. This fetches them all
 * at once, so the whole course works offline (e.g. before a trip). Only shown where it can work.
 */
export function SaveOfflineButton() {
  const [s, setS] = useState<State>({ phase: 'idle', done: 0, total: 0 })
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null

  const save = async () => {
    const topics = getAllTopics()
    const tasks = [
      ...topics.flatMap((t) => (t.loadLesson ? [t.loadLesson] : [])),
      ...topics.filter((t) => t.hasPractice).map((t) => () => loadPractice(t.key)),
      ...Object.values(labModules),
    ]
    setS({ phase: 'saving', done: 0, total: tasks.length })
    const failed = await runAll(tasks, (done) => setS((x) => ({ ...x, done })))
    setS((x) => ({ ...x, phase: failed ? 'error' : 'done' }))
  }

  return (
    <div className="rounded-lg border px-3 py-2">
      <button type="button" onClick={save} disabled={s.phase === 'saving'} className="flex w-full items-center justify-between text-left disabled:opacity-70">
        <span>💾 Save everything for offline</span>
        <span className="text-xs font-semibold">{s.phase === 'saving' ? `${Math.round((100 * s.done) / (s.total || 1))}%` : s.phase === 'done' ? '✓ Saved' : 'About 2 MB'}</span>
      </button>
      {s.phase === 'saving' && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={s.total} aria-valuenow={s.done} aria-label="Saving for offline">
          <div className="h-full bg-brand transition-all" style={{ width: `${(100 * s.done) / (s.total || 1)}%` }} />
        </div>
      )}
      {s.phase === 'done' && <p className="mt-1 text-xs text-muted-foreground">Every lesson, lab and practice set now works without internet on this device.</p>}
      {s.phase === 'error' && <p className="mt-1 text-xs text-destructive">Some files couldn’t be saved. Check your connection and try again.</p>}
      {s.phase === 'idle' && <p className="mt-1 text-xs text-muted-foreground">Pages you open are saved automatically. This saves the rest too, e.g. before travelling.</p>}
    </div>
  )
}
