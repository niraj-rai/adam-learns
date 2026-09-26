import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { collide, kineticEnergy, momentum } from '../_shared/dynamics'

const W = 560
const CART = 50
const PX = 30 // pixels per metre
const f1 = (x: number) => (Math.round(x * 100) / 100).toFixed(2).replace('-', '−')

const BOUNCE = [
  { e: 1, label: '🏀 Bouncy (elastic)' },
  { e: 0.5, label: '🥎 In between' },
  { e: 0, label: '🧲 Sticky' },
]
const PRESETS = [
  { name: 'Equal carts, bouncy', m1: 1, u1: 3, m2: 1, u2: 0, e: 1 },
  { name: 'Truck hits car', m1: 5, u1: 2, m2: 1, u2: 0, e: 0.5 },
  { name: 'Car hits truck', m1: 1, u1: 4, m2: 5, u2: 0, e: 1 },
  { name: 'Head-on, stick', m1: 2, u1: 2, m2: 2, u2: -2, e: 0 },
]

export default function CollisionLab() {
  const [m1, setM1] = useState(1)
  const [u1, setU1] = useState(3)
  const [m2, setM2] = useState(1)
  const [u2, setU2] = useState(0)
  const [e, setE] = useState(1)
  const [t, setT] = useState(0)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const after = collide(m1, u1, m2, u2, e)
  const gap = 200 - CART // px between carts at the start
  const closing = u1 - u2
  const tHit = closing > 0 ? gap / PX / closing : Infinity
  const pos = (u: number, v: number) => (t <= tHit ? u * t : u * tHit + v * (t - tHit))
  const xA = 120 + pos(u1, after.v1) * PX
  const xB = 320 + pos(u2, after.v2) * PX
  const hit = t > tHit
  const reset = () => { cancelAnimationFrame(raf.current); setT(0) }
  const run = () => {
    reset()
    const start = performance.now()
    const tick = (now: number) => {
      const el = (now - start) / 1000
      setT(el)
      if (el < Math.min(6, (Number.isFinite(tHit) ? tHit : 0) + 3)) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const set = (fn: () => void) => { fn(); reset() }
  const pBefore = momentum(m1, u1) + momentum(m2, u2)
  const pAfter = momentum(m1, after.v1) + momentum(m2, after.v2)
  const keBefore = kineticEnergy(m1, u1) + kineticEnergy(m2, u2)
  const keAfter = kineticEnergy(m1, after.v1) + kineticEnergy(m2, after.v2)

  return (
    <LabFrame labId="collision-lab" title="Collision Lab" subtitle="In every collision the total momentum stays the same." howTo={<p>Set each cart's mass and velocity (right is positive), choose how bouncy the collision is, then press Run. Compare the momentum before and after.</p>}>
      <div className="mb-3 flex flex-wrap gap-1">
        {PRESETS.map((p) => <button key={p.name} type="button" onClick={() => set(() => { setM1(p.m1); setU1(p.u1); setM2(p.m2); setU2(p.u2); setE(p.e) })} className="rounded-lg border-2 px-2.5 py-1 text-sm hover:bg-muted">{p.name}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} 110`} className="w-full rounded-2xl border bg-background" role="img" aria-label="Two carts on a track">
        <rect x={0} y={88} width={W} height={6} fill="#94a3b8" />
        {[{ x: xA, m: m1, c: '#f97316', v: hit ? after.v1 : u1 }, { x: xB, m: m2, c: '#8b5cf6', v: hit ? after.v2 : u2 }].map((c, i) => (
          <g key={i} transform={`translate(${c.x},0)`}>
            <rect x={0} y={88 - 20 - c.m * 5} width={CART} height={20 + c.m * 5} rx={4} fill={c.c} />
            <text x={CART / 2} y={83} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>{c.m} kg</text>
            <text x={CART / 2} y={88 - 26 - c.m * 5} textAnchor="middle" fontSize={11} fill="currentColor">{f1(c.v)} m/s</text>
          </g>
        ))}
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border p-3 text-sm">
          <p className="font-semibold text-orange-600">Orange cart</p>
          <label className="block">mass <b>{m1} kg</b><Slider value={[m1]} min={1} max={5} step={1} onValueChange={([v]) => set(() => setM1(v))} aria-label="orange mass" /></label>
          <label className="block">velocity <b>{u1} m/s</b><Slider value={[u1]} min={-4} max={4} step={1} onValueChange={([v]) => set(() => setU1(v))} aria-label="orange velocity" /></label>
        </div>
        <div className="space-y-2 rounded-xl border p-3 text-sm">
          <p className="font-semibold text-violet-600">Purple cart</p>
          <label className="block">mass <b>{m2} kg</b><Slider value={[m2]} min={1} max={5} step={1} onValueChange={([v]) => set(() => setM2(v))} aria-label="purple mass" /></label>
          <label className="block">velocity <b>{u2} m/s</b><Slider value={[u2]} min={-4} max={4} step={1} onValueChange={([v]) => set(() => setU2(v))} aria-label="purple velocity" /></label>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        {BOUNCE.map((b) => <button key={b.e} type="button" aria-pressed={e === b.e} onClick={() => set(() => setE(b.e))} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', e === b.e ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{b.label}</button>)}
        <span className="ml-auto flex gap-2"><Button onClick={run}>▶ Run</Button><Button variant="outline" onClick={reset}>Reset</Button></span>
      </div>
      {closing <= 0 ? (
        <p className="mt-3 rounded-xl bg-warn-soft px-4 py-2 text-sm">These carts will never meet: the orange cart must be moving right faster than the purple one.</p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Readout label="Total momentum p = mv" value={`${f1(pBefore)} → ${f1(pAfter)} kg m/s`} />
          <Readout label="Total kinetic energy ½mv²" value={`${f1(keBefore)} → ${f1(keAfter)} J`} />
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Momentum is conserved</b> in every collision (as long as no outside force acts). Kinetic energy is only kept in a perfectly bouncy collision; when carts squash or stick, some turns into heat and sound.</p>
    </LabFrame>
  )
}
