import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { PERSISTENCE, SPEED, echoTime, minEchoDistance } from '../_shared/waves'

const W = 560
const SLOW = 4 // the animation runs 4× slower than real life

export default function EchoCanyon() {
  const [d, setD] = useState(100)
  const [t, setT] = useState<number | null>(null)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const tEcho = echoTime(d)
  const distinct = tEcho >= PERSISTENCE
  const clap = () => {
    cancelAnimationFrame(raf.current)
    sfx.click()
    const start = performance.now()
    let heard = false
    const tick = (now: number) => {
      const el = (now - start) / 1000 / SLOW
      setT(el)
      if (!heard && el >= tEcho) { heard = true; if (distinct) sfx.click() }
      if (el < tEcho + 0.15) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const X = (m: number) => 50 + (m / 400) * (W - 110)
  const cliff = X(d)
  const travelled = t === null ? 0 : t * SPEED.air
  const out = Math.min(travelled, d)
  const back = Math.max(0, Math.min(travelled - d, d))
  const going = t !== null && travelled < d
  const returning = t !== null && travelled >= d && travelled < 2 * d
  const front = going ? X(out) : returning ? X(d - back) : null
  return (
    <LabFrame labId="echo-canyon" title="Echo Canyon" subtitle="An echo is reflected sound. Time it to measure distance, but only if the wall is far enough away." howTo={<p>Move the cliff and clap. The sound pulse travels to the cliff and back at 344 m/s (shown 4× slower). You hear a separate echo only if it returns at least 0.1 s after your clap.</p>}>
      <svg viewBox={`0 0 ${W} 150`} className="w-full rounded-2xl border bg-sky-50 dark:bg-sky-950/30" role="img" aria-label={`Cliff ${d} m away; echo after ${tEcho.toFixed(2)} s`}>
        <rect x={0} y={120} width={W} height={30} fill="#65a30d" opacity={0.4} />
        <text x={36} y={118} fontSize={28}>🧍</text>
        <path d={`M${cliff},120 L${cliff},30 L${cliff + 20},20 L${W},20 L${W},120 Z`} fill="#78716c" />
        {front !== null && <path d={`M${front},${70 - 30} Q${front + (going ? 14 : -14)},70 ${front},${70 + 30}`} fill="none" stroke={going ? '#6366f1' : '#f97316'} strokeWidth={3} />}
        <line x1={X(0)} y1={134} x2={cliff} y2={134} stroke="currentColor" strokeOpacity={0.5} />
        <text x={(X(0) + cliff) / 2} y={146} textAnchor="middle" fontSize={11} fill="currentColor">{d} m</text>
        <line x1={X(minEchoDistance())} y1={20} x2={X(minEchoDistance())} y2={120} stroke="#ef4444" strokeDasharray="4 3" />
        <text x={X(minEchoDistance()) + 4} y={30} fontSize={9} fill="#ef4444">17.2 m</text>
      </svg>
      <label className="mt-3 block text-sm">Distance to the cliff <b>{d} m</b><Slider value={[d]} min={5} max={400} step={1} onValueChange={([v]) => { setD(v); setT(null) }} className="mt-1" aria-label="distance to cliff" /></label>
      <Button className="mt-3" onClick={clap}>👏 Clap!</Button>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Sound travels" value={`2 × ${d} = ${2 * d} m`} />
        <Readout label="Echo time t = 2d ÷ v" value={`${tEcho.toFixed(3)} s`} />
        <Readout label="Stopwatch" value={t === null ? '—' : `${Math.min(t, tEcho).toFixed(3)} s`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {distinct
          ? <>✅ <b>Distinct echo.</b> The sound takes {tEcho.toFixed(2)} s to come back, longer than the 0.1 s your brain holds on to a sound. Measuring the time lets you find the distance: d = v × t ÷ 2.</>
          : <>🔁 <b>No separate echo.</b> It comes back after only {tEcho.toFixed(3)} s, less than 0.1 s, so it blends with the original sound and makes it seem longer: <b>reverberation</b>. The wall must be at least 344 × 0.1 ÷ 2 = <b>17.2 m</b> away.</>}
      </p>
    </LabFrame>
  )
}
