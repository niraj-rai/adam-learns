import { Check, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'
import { renderSVG } from 'uqr'
import { Button } from '@/components/ui/button'
import { getSubjects } from '@/content/loader'
import { gradeTopics } from '@/lib/learner'
import { needsAttention, recentActivity, subjectSummary, timeSummary } from '@/lib/report'
import { activeInLast, shiftIso, todayIso } from '@/lib/schedule'
import { encodeSnapshot, type Snapshot } from '@/lib/snapshot'
import { useExams } from '@/stores/exams'
import { useProfile } from '@/stores/profile'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { useTime } from '@/stores/time'

/** Build a snapshot of this device's progress (read at the moment of sharing). */
function makeSnapshot(): Snapshot {
  const { firstName, grade } = useProfile.getState()
  const { xp, topics, badges, activeDays, review } = useProgress.getState()
  const time = useTime.getState()
  const today = todayIso()
  const subjects = getSubjects()
  const ts = timeSummary(time, today, subjects.map((s) => s.id))
  return {
    v: 1,
    n: firstName || 'Learner',
    g: grade,
    d: today,
    xp,
    st: currentStreak(activeDays),
    ad: activeInLast(activeDays, 14, today),
    b: badges.length,
    due: dueReviewItems(review).length,
    s: Object.fromEntries(subjects.map((s) => {
      const sum = subjectSummary(grade ? gradeTopics(s.id, grade) : s.units.flatMap((u) => u.topics), topics)
      return [s.id, [sum.mastered, sum.started, sum.total]]
    })),
    t: {
      to: ts.today,
      wk: ts.week,
      all: ts.allTime,
      days: Array.from({ length: 14 }, (_, i) => time.days[shiftIso(today, i - 13)] ?? 0),
      sub: Object.fromEntries(ts.subjects.filter((x) => x.week > 0).map((x) => [x.id, x.week])),
    },
    w: needsAttention(topics, review, today).slice(0, 5).map((a) => a.key),
    r: recentActivity(topics, 20).filter((x) => x.p.masteredAt).slice(0, 5).map((x) => x.key),
    ex: useExams.getState().history.slice(0, 5).map((h) => [h.subjectId, h.grade, h.format, h.earned, h.total, h.date]),
  }
}

/** Card on the report page: make a link (and QR code) a parent can open on their own phone. */
export function ShareWithParent() {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const create = async () => {
    const code = await encodeSnapshot(makeSnapshot())
    setUrl(`${window.location.origin}${import.meta.env.BASE_URL}parent#d=${code}`)
    setCopied(false)
  }
  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator
  return (
    <section className="rounded-2xl border-2 border-brand/40 bg-brand-soft p-4 print:hidden">
      <h2 className="font-heading text-xl font-semibold">👨‍👩‍👧 Share with a parent</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Makes a link to a read-only snapshot of this report, to open on a parent's own phone. There are no accounts: the progress is packed into the link itself and never stored on a server. Share a fresh link whenever you want to show the latest.
      </p>
      {!url ? (
        <Button className="mt-3" onClick={create}><Share2 /> Create a share link</Button>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="space-y-2">
            <input readOnly value={url} onFocus={(e) => e.target.select()} className="w-full truncate rounded-lg border bg-background px-3 py-2 font-mono text-xs" aria-label="Share link" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={copy}>{copied ? <><Check /> Copied</> : <><Copy /> Copy link</>}</Button>
              {canShare && <Button size="sm" variant="outline" onClick={() => void navigator.share({ title: 'AdamLearns progress', text: 'My learning progress on AdamLearns', url }).catch(() => {})}><Share2 /> Share…</Button>}
              <Button size="sm" variant="ghost" onClick={create}>Refresh</Button>
            </div>
            <p className="text-xs text-muted-foreground">⚠️ Anyone with this link can see the snapshot (first name, grade and progress), so share it only with family.</p>
          </div>
          {url.length < 1200 && (
            // the SVG is generated locally by uqr from our own link
            <div className="mx-auto w-40 rounded-lg bg-white p-2" role="img" aria-label="QR code for the share link: scan it with a parent's phone camera" dangerouslySetInnerHTML={{ __html: renderSVG(url, { ecc: 'L', border: 1 }) }} />
          )}
        </div>
      )}
    </section>
  )
}
