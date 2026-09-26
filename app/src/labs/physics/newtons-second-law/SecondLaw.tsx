import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { TRACK_M, runTrial, type Trial } from './model'

const W = 560
const MASS_COLOURS: Record<number, string> = { 1: '#6366f1', 2: '#10b981', 3: '#f59e0b', 4: '#ef4444' }

export default function SecondLaw() {
  const [force, setForce] = useState(4)
  const [mass, setMass] = useState(1)
  const [t, setT] = useState<number | null>(null)
  const [trials, setTrials] = useState<Trial[]>([])
  const [atEnd, setAtEnd] = useState(false)
  const raf = useRef(0)
  const a = force / mass
  const running = t !== null
  const trial = runTrial(force, mass)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const go = () => {
    const start = performance.now()
    const tick = (now: number) => {
      const el = (now - start) / 1000
      if (el >= trial.time) {
        setT(null)
        setAtEnd(true)
        setTrials((ts) => [trial, ...ts.filter((x) => !(x.force === trial.force && x.mass === trial.mass))].slice(0, 12))
        return
      }
      setT(el)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const s = t === null ? (atEnd ? TRACK_M : 0) : 0.5 * a * t * t
  const X = (m: number) => 60 + (m / TRACK_M) * (W - 140)
  const aMax = 20
  const PX = (f: number) => 40 + (f / 10) * 220
  const PY = (acc: number) => 150 - (Math.min(acc, aMax) / aMax) * 130

  return (
    <LabFrame labId="newtons-second-law" title="Newton's Second Law" subtitle="Force = mass × acceleration. Push harder, or carry less, to accelerate more." howTo={<p>Choose the pulling force and the trolley's mass, then press Go. Two light gates time the trolley over 2 m, and the acceleration is worked out from a = 2s ÷ t². Record several runs and look at the graph.</p>}>
      <svg viewBox={`0 0 ${W} 120`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Trolley of ${mass} kg pulled by ${force} N`}>
        <rect x={40} y={86} width={W - 80} height={8} rx={4} fill="#94a3b8" />
        {[0, TRACK_M].map((g) => <g key={g}><line x1={X(g) + 25} y1={30} x2={X(g) + 25} y2={86} stroke="#ef4444" strokeDasharray="4 3" /><text x={X(g) + 25} y={24} textAnchor="middle" fontSize={10} fill="currentColor">gate {g ? 2 : 1}</text></g>)}
        <g transform={`translate(${X(s)}, 0)`}>
          <rect x={0} y={56} width={50} height={26} rx={4} fill="#6366f1" />
          {Array.from({ length: mass }, (_, i) => <rect key={i} x={4 + i * 11} y={46} width={9} height={10} fill="#78350f" />)}
          <circle cx={10} cy={86} r={6} fill="#1e293b" /><circle cx={40} cy={86} r={6} fill="#1e293b" />
          <line x1={50} y1={66} x2={50 + 20 + force * 3} y2={66} stroke="#16a34a" strokeWidth={4} />
          <text x={60 + force * 1.5} y={60} fontSize={11} fill="#16a34a" fontWeight={600}>{force} N</text>
        </g>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Pulling force F = <b>{force} N</b><Slider value={[force]} min={1} max={10} step={1} disabled={running} onValueChange={([v]) => { setForce(v); setAtEnd(false) }} className="mt-1" aria-label="force" /></label>
        <label className="text-sm">Mass m = <b>{mass} kg</b> (each brick is 1 kg)<Slider value={[mass]} min={1} max={4} step={1} disabled={running} onValueChange={([v]) => { setMass(v); setAtEnd(false) }} className="mt-1" aria-label="mass" /></label>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={go} disabled={running}>▶ Go</Button>
        <Button variant="outline" onClick={() => setTrials([])}>Clear results</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Time between gates" value={running ? `${t!.toFixed(2)} s…` : `${trial.time.toFixed(2)} s`} />
        <Readout label="a = 2s ÷ t²" value={`${trial.a.toFixed(2)} m/s²`} />
        <Readout label="F ÷ m" value={`${force} ÷ ${mass} = ${(force / mass).toFixed(2)} m/s²`} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <svg viewBox="0 0 280 175" className="w-full rounded-2xl border bg-background" role="img" aria-label="Graph of acceleration against force for each mass">
          <line x1={40} y1={150} x2={270} y2={150} stroke="currentColor" /><line x1={40} y1={10} x2={40} y2={150} stroke="currentColor" />
          <text x={270} y={168} textAnchor="end" fontSize={10} fill="currentColor">force (N) → 10</text>
          <text x={44} y={14} fontSize={10} fill="currentColor">a (m/s²) {aMax}</text>
          {[1, 2, 3, 4].filter((m) => trials.some((x) => x.mass === m)).map((m) => <line key={m} x1={PX(0)} y1={PY(0)} x2={PX(10)} y2={PY(10 / m)} stroke={MASS_COLOURS[m]} strokeOpacity={0.35} strokeDasharray="4 3" />)}
          {trials.map((x, i) => <circle key={i} cx={PX(x.force)} cy={PY(x.a)} r={4} fill={MASS_COLOURS[x.mass]} />)}
        </svg>
        <table className="w-full self-start rounded-xl border text-center text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-1">F (N)</th><th className="p-1">m (kg)</th><th className="p-1">t (s)</th><th className="p-1">a (m/s²)</th><th className="p-1">m × a</th></tr></thead>
          <tbody>
            {trials.length === 0 && <tr><td colSpan={5} className="p-3 text-muted-foreground">Press Go to record a run</td></tr>}
            {trials.map((x, i) => <tr key={i} className="border-t"><td className="p-1" style={{ color: MASS_COLOURS[x.mass] }}>{x.force}</td><td className="p-1" style={{ color: MASS_COLOURS[x.mass] }}>{x.mass}</td><td className="p-1 font-mono">{x.time.toFixed(2)}</td><td className="p-1 font-mono">{x.a.toFixed(2)}</td><td className="p-1 font-mono font-semibold">{(x.mass * x.a).toFixed(1)}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">For each mass the points lie on a <b>straight line through the origin</b>: a ∝ F. A heavier trolley gives a less steep line: a ∝ 1/m. Together: <b>F = ma</b>. Check the last column: m × a always equals the force. 1 newton is the force that gives 1 kg an acceleration of 1 m/s².</p>
    </LabFrame>
  )
}
