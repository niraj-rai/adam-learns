import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { pushApart } from '../_shared/dynamics'

const W = 560
const PUSH_TIME = 0.5
const f2 = (x: number) => (Math.round(x * 100) / 100).toString().replace('-', '−')

const EXAMPLES = [
  { emoji: '🚶', title: 'Walking', text: 'Your foot pushes the ground backwards; the ground pushes you forwards.' },
  { emoji: '🚀', title: 'Rocket', text: 'The engine pushes hot gas down; the gas pushes the rocket up. No air is needed.' },
  { emoji: '🚣', title: 'Rowing', text: 'The oar pushes water back; the water pushes the boat forward.' },
  { emoji: '🔫', title: 'Recoil', text: 'A water gun pushes water forward; the water pushes the gun back into your hand.' },
]

export default function ActionReaction() {
  const [m1, setM1] = useState(40)
  const [m2, setM2] = useState(60)
  const [force, setForce] = useState(120)
  const [t, setT] = useState(0)
  const raf = useRef(0)
  const r = pushApart(m1, m2, force, PUSH_TIME)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const go = () => {
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const tick = (now: number) => {
      const el = (now - start) / 1000
      setT(Math.min(el, 3))
      if (el < 3) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  // position: accelerate during the push, then glide on ice
  const pos = (a: number, v: number) => (t <= PUSH_TIME ? 0.5 * a * t * t : 0.5 * a * PUSH_TIME ** 2 + v * (t - PUSH_TIME))
  const px = 40
  const x1 = W / 2 - 30 + pos(r.a1, r.v1) * px
  const x2 = W / 2 + 30 + pos(r.a2, r.v2) * px
  const pushing = t > 0 && t <= PUSH_TIME
  const size = (m: number) => 26 + m / 4

  return (
    <LabFrame labId="action-reaction" title="Action and Reaction" subtitle="Forces come in pairs: equal in size, opposite in direction, acting on different objects." howTo={<p>Two skaters stand still on ice and push each other apart. Change their masses and the push, then press Push!</p>}>
      <svg viewBox={`0 0 ${W} 150`} className="w-full rounded-2xl border bg-sky-50 dark:bg-sky-950/30" role="img" aria-label={`Skaters of ${m1} kg and ${m2} kg push apart`}>
        <rect x={0} y={120} width={W} height={30} fill="#bae6fd" opacity={0.6} />
        <g transform={`translate(${x1},0)`}><circle cx={0} cy={120 - size(m1) / 1.6} r={size(m1) / 1.6} fill="#ec4899" /><text x={0} y={124 - size(m1) / 1.6} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>{m1} kg</text></g>
        <g transform={`translate(${x2},0)`}><circle cx={0} cy={120 - size(m2) / 1.6} r={size(m2) / 1.6} fill="#0ea5e9" /><text x={0} y={124 - size(m2) / 1.6} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>{m2} kg</text></g>
        {(pushing || t === 0) && (
          <g>
            <line x1={x1} y1={40} x2={x1 - force / 4} y2={40} stroke="#ec4899" strokeWidth={4} /><path d={`M${x1 - force / 4 - 10},40 l10,-7 v14 z`} fill="#ec4899" />
            <line x1={x2} y1={40} x2={x2 + force / 4} y2={40} stroke="#0ea5e9" strokeWidth={4} /><path d={`M${x2 + force / 4 + 10},40 l-10,-7 v14 z`} fill="#0ea5e9" />
            <text x={W / 2} y={20} textAnchor="middle" fontSize={11} fill="currentColor">{force} N on each skater, in opposite directions</text>
          </g>
        )}
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm"><span className="font-semibold text-pink-600">Pink</span> mass <b>{m1} kg</b><Slider value={[m1]} min={20} max={100} step={5} onValueChange={([v]) => { setM1(v); setT(0) }} className="mt-1" aria-label="pink skater mass" /></label>
        <label className="text-sm"><span className="font-semibold text-sky-600">Blue</span> mass <b>{m2} kg</b><Slider value={[m2]} min={20} max={100} step={5} onValueChange={([v]) => { setM2(v); setT(0) }} className="mt-1" aria-label="blue skater mass" /></label>
        <label className="text-sm">Push <b>{force} N</b> for {PUSH_TIME} s<Slider value={[force]} min={40} max={200} step={20} onValueChange={([v]) => { setForce(v); setT(0) }} className="mt-1" aria-label="push force" /></label>
      </div>
      <Button className="mt-3" onClick={go}>🤲 Push!</Button>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Readout label="Force on each" value={`${force} N (opposite)`} />
        <Readout label="Accelerations a = F ÷ m" value={<span className="text-base"><span className="text-pink-600">{f2(Math.abs(r.a1))}</span> · <span className="text-sky-600">{f2(r.a2)}</span> m/s²</span>} />
        <Readout label="Final velocities" value={<span className="text-base"><span className="text-pink-600">{f2(r.v1)}</span> · <span className="text-sky-600">{f2(r.v2)}</span> m/s</span>} />
        <Readout label="Total momentum" value={`${f2(m1 * r.v1)} + ${f2(m2 * r.v2)} = 0`} />
      </div>
      <p className={cn('mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm')}>Both skaters feel the <b>same size</b> force (Newton's third law), but the lighter one gets the bigger acceleration (second law). They started with zero momentum, and the total is still zero: their momenta are equal and opposite.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {EXAMPLES.map((e) => <div key={e.title} className="rounded-xl border p-3 text-sm"><b>{e.emoji} {e.title}:</b> {e.text}</div>)}
      </div>
    </LabFrame>
  )
}
