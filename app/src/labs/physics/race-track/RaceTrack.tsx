import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

/** Typical top speeds in m/s. */
const RACERS = [
  { id: 'snail', name: 'Snail', emoji: '🐌', speed: 0.01 },
  { id: 'adam', name: 'Adam (running)', emoji: '🏃', speed: 5 },
  { id: 'cycle', name: 'Cyclist', emoji: '🚴', speed: 6 },
  { id: 'auto', name: 'Auto-rickshaw', emoji: '🛺', speed: 13.9 },
  { id: 'cheetah', name: 'Cheetah', emoji: '🐆', speed: 30 },
  { id: 'vande', name: 'Vande Bharat train', emoji: '🚄', speed: 44.4 },
]
const DISTANCES = [100, 400, 1000]
const SIM_SECONDS = 6 // the slowest racer's run is squeezed into about this many seconds (except the snail)

export default function RaceTrack() {
  const [chosen, setChosen] = useState<string[]>(['adam', 'auto', 'cheetah'])
  const [distance, setDistance] = useState(100)
  const [t, setT] = useState(0) // real race seconds
  const [running, setRunning] = useState(false)
  const [target, setTarget] = useState<string | null>(null)
  const [guess, setGuess] = useState('')
  const [unit, setUnit] = useState<'ms' | 'kmh'>('ms')
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const raf = useRef(0)

  const racers = RACERS.filter((r) => chosen.includes(r.id))
  const finishTimes = racers.map((r) => distance / r.speed)
  const slowestNonSnail = Math.max(...racers.filter((r) => r.id !== 'snail').map((r) => distance / r.speed), 1)
  const scale = slowestNonSnail / SIM_SECONDS

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const loop = (now: number) => {
      const dt = ((now - last) / 1000) * scale
      last = now
      setT((x) => {
        const n = x + dt
        if (n >= slowestNonSnail) {
          setRunning(false)
          sfx.win()
          return slowestNonSnail
        }
        return n
      })
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [running, scale, slowestNonSnail])

  const done = t >= slowestNonSnail - 1e-6 && t > 0
  const tr = RACERS.find((r) => r.id === target)
  const check = () => {
    if (!tr) return
    const want = unit === 'ms' ? tr.speed : tr.speed * 3.6
    const ok = Math.abs(Number(guess) - want) <= Math.max(0.2, want * 0.03)
    setResult(ok ? 'right' : 'wrong')
    ;(ok ? sfx.correct : sfx.wrong)()
  }

  return (
    <LabFrame
      labId="race-track"
      title="Race Track"
      subtitle="Who is fastest? Race them, time them, and calculate their speed."
      howTo={<p>Pick up to 4 racers and a distance, then race. Use the finishing times to calculate each racer's speed: <b>speed = distance ÷ time</b>.</p>}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {RACERS.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={running}
            onClick={() => {
              setChosen((c) => (c.includes(r.id) ? c.filter((x) => x !== r.id) : c.length < 4 ? [...c, r.id] : c))
              setT(0)
            }}
            className={cn('rounded-full border px-3 py-1.5 text-sm', chosen.includes(r.id) ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}
          >
            {r.emoji} {r.name}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">Distance:</span>
        {DISTANCES.map((d) => (
          <button key={d} type="button" disabled={running} onClick={() => { setDistance(d); setT(0) }} className={cn('rounded-full border px-3 py-1', d === distance ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {d >= 1000 ? `${d / 1000} km` : `${d} m`}
          </button>
        ))}
      </div>

      <div className="space-y-2 rounded-2xl border bg-background p-3">
        {racers.map((r, k) => {
          const pos = Math.min(1, (r.speed * t) / distance)
          return (
            <div key={r.id} className="relative h-12 rounded-lg bg-muted/50">
              <div className="absolute top-0 right-6 h-full w-1 bg-[repeating-linear-gradient(0deg,#111_0_6px,#fff_6px_12px)]" />
              <motion.span className="absolute top-1/2 text-3xl" style={{ left: `calc(${pos * 100}% * 0.92)`, translateY: '-50%', scaleX: -1 }}>
                {r.emoji}
              </motion.span>
              {pos >= 1 && <span className="absolute top-1 right-8 text-xs font-semibold">✅ {finishTimes[k].toFixed(1)} s</span>}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="lg" disabled={racers.length === 0 || running} onClick={() => { setT(0); setRunning(true) }}>🏁 Start race</Button>
        <span className="text-sm tabular-nums text-muted-foreground">Race clock: {t.toFixed(1)} s</span>
        {chosen.includes('snail') && <span className="text-xs text-muted-foreground">(The snail would take {(distance / 0.01 / 3600).toFixed(1)} hours!)</span>}
      </div>

      {done && (
        <div className="mt-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr><th className="py-1">Racer</th><th>Distance</th><th>Time</th><th>Speed</th></tr>
              </thead>
              <tbody>
                {racers.map((r, k) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-1.5">{r.emoji} {r.name}</td>
                    <td>{distance} m</td>
                    <td>{r.id === 'snail' ? `${(finishTimes[k] / 3600).toFixed(1)} h` : `${finishTimes[k].toFixed(1)} s`}</td>
                    <td>
                      <button type="button" onClick={() => { setTarget(r.id); setGuess(''); setResult(null) }} className="text-chem underline">calculate it</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tr && (
            <div className="rounded-xl border bg-chem-soft p-3 text-sm">
              <p className="font-semibold">{tr.emoji} {tr.name}: {distance} m in {(distance / tr.speed).toFixed(1)} s. What is the speed?</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input value={guess} onChange={(e) => { setGuess(e.target.value); setResult(null) }} inputMode="decimal" className="h-9 w-28 rounded-lg border bg-background px-3" aria-label="Your speed" />
                <select value={unit} onChange={(e) => { setUnit(e.target.value as 'ms' | 'kmh'); setResult(null) }} className="h-9 rounded-lg border bg-background px-2" aria-label="Unit">
                  <option value="ms">m/s</option>
                  <option value="kmh">km/h</option>
                </select>
                <Button size="sm" variant="outline" onClick={check} disabled={!guess}>Check</Button>
              </div>
              {result && (
                <p className="mt-2" role="status">
                  {result === 'right' ? '✅ ' : '❌ '}
                  {tr.speed.toFixed(tr.speed < 1 ? 2 : 1)} m/s = {(tr.speed * 3.6).toFixed(1)} km/h. (speed = {distance} ÷ {(distance / tr.speed).toFixed(1)}; to convert m/s → km/h, multiply by 3.6)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </LabFrame>
  )
}
