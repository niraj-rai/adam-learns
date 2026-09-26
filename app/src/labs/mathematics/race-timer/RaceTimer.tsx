import { useEffect, useRef, useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SliderRow } from '../_shared/SliderRow'

const RACERS = [
  { name: 'Cheetah', emoji: '🐆', speed: 30 },
  { name: 'Horse', emoji: '🐎', speed: 20 },
  { name: 'Usain Bolt', emoji: '🏃', speed: 10.4 },
  { name: 'A Grade 5 runner', emoji: '🧒', speed: 5 },
  { name: 'Elephant', emoji: '🐘', speed: 7 },
]

export default function RaceTimer() {
  const [target, setTarget] = useState(5)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const start = useRef(0)
  const [now, setNow] = useState(0)
  const [dist, setDist] = useState(100)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(performance.now()), 50)
    return () => clearInterval(id)
  }, [running])
  const toggle = () => {
    if (running) { setElapsed((performance.now() - start.current) / 1000); setRunning(false) }
    else { start.current = performance.now(); setNow(start.current); setElapsed(null); setRunning(true) }
  }
  const shown = running ? (now - start.current) / 1000 : elapsed ?? 0
  const off = elapsed !== null ? elapsed - target : null
  return (
    <LabFrame labId="race-timer" title="Racing Seconds" subtitle="How long is a second? Train your inner clock, then compare how fast different racers are." howTo={<p>Press Start, count in your head, and press Stop when you think the target time has passed. The timer is hidden while it runs!</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="space-y-3 rounded-2xl border p-4 text-center">
          <SliderRow label="Target (seconds)" value={target} min={3} max={15} onChange={setTarget} />
          <p className="font-heading text-5xl font-bold">{running ? '⏳' : `${shown.toFixed(2)} s`}</p>
          <button type="button" onClick={toggle} className="rounded-xl border-2 border-chem bg-chem-soft px-6 py-2 font-semibold">{running ? 'Stop' : 'Start'}</button>
          {off !== null && <p className="text-sm">{Math.abs(off) < 0.3 ? '🎯 Amazing! ' : Math.abs(off) < 1 ? '👍 Close! ' : '🙂 Try again: '}You were {Math.abs(off).toFixed(2)} s {off > 0 ? 'late' : 'early'}.</p>}
          <p className="text-xs text-muted-foreground">Tip: count “one-Mississippi, two-Mississippi…” or “one-thousand-one…”.</p>
        </div>
        <div className="space-y-3">
          <SliderRow label="Race distance (m)" value={dist} min={50} max={400} step={50} onChange={setDist} />
          <div className="space-y-1">{RACERS.map((r) => { const t = dist / r.speed; return (
            <div key={r.name} className="flex items-center gap-2 text-sm"><span className="w-6 text-lg">{r.emoji}</span><div className="h-3 flex-1 rounded bg-muted"><div className="h-3 rounded bg-chem" style={{ width: `${(Math.min(t, 80) / 80) * 100}%` }} /></div><span className="w-32 text-right">{r.name}: {t.toFixed(1)} s</span></div>
          ) })}</div>
          <Readout label="1 minute" value="60 seconds · 1 hour = 60 minutes = 3600 seconds" />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Races are timed to <b>hundredths of a second</b>. Usain Bolt ran 100 m in 9.58 s in 2009. The cheetah is the fastest land animal, over 100 km/h in short bursts. Shorter time for the same distance means faster!</p>
    </LabFrame>
  )
}
