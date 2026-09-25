import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { stepBox } from './model'

const MASS = 20 // kg
const TRACK = 20 // m

export default function ForcePlayground() {
  const [left, setLeft] = useState(40)
  const [right, setRight] = useState(40)
  const [friction, setFriction] = useState(true)
  const [ui, setUi] = useState({ x: TRACK / 2, v: 0 })
  const s = useRef({ x: TRACK / 2, v: 0, acc: 0 })
  const FRICTION = friction ? 30 : 0 // N, sliding friction on a rough floor

  // Blue pushes to the right (+), Red pushes to the left (−)
  const net = left - right
  useAnimationFrame((dt) => {
    const st = s.current
    st.v = stepBox(st.v, net, FRICTION, MASS, dt)
    st.x += st.v * dt
    if (st.x < 1 || st.x > TRACK - 1) {
      st.x = Math.max(1, Math.min(TRACK - 1, st.x))
      st.v = 0
    }
    st.acc += dt
    if (st.acc > 0.05) {
      st.acc = 0
      setUi({ x: st.x, v: st.v })
    }
  })

  const reset = () => {
    s.current = { x: TRACK / 2, v: 0, acc: 0 }
    setUi({ x: TRACK / 2, v: 0 })
  }

  const state = net === 0 ? 'balanced' : Math.abs(net) <= FRICTION && ui.v === 0 ? 'held' : 'unbalanced'
  const arrow = (n: number) => Math.min(120, n * 1.2)

  return (
    <LabFrame
      labId="force-playground"
      title="Force Playground"
      subtitle="Two teams push a heavy box. What happens when the forces are balanced or unbalanced?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Set how hard each team pushes (in newtons, N). Watch the net force and the box.</li>
          <li>Try equal pushes, then unequal ones. Switch friction off to see a box on ice!</li>
          <li>Challenge: get the box moving, then make it stop without it touching a wall.</li>
        </ul>
      }
    >
      <svg viewBox="0 0 400 150" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Box at ${ui.x.toFixed(1)} m, speed ${Math.abs(ui.v).toFixed(2)} m/s, forces ${state}`}>
        <rect x={0} y={112} width={400} height={38} fill={friction ? '#d6d3d1' : '#bae6fd'} />
        {friction && Array.from({ length: 40 }, (_, i) => <circle key={i} cx={5 + i * 10} cy={118 + (i % 3) * 5} r={1} fill="#a8a29e" />)}
        {(() => {
          const bx = (ui.x / TRACK) * 400
          return (
            <g>
              <rect x={bx - 30} y={60} width={60} height={52} rx={4} fill="#c2410c" stroke="#7c2d12" />
              <text x={bx} y={92} textAnchor="middle" fontSize={11} fill="#fff">{MASS} kg</text>
              {left > 0 && (
                <g>
                  <line x1={bx - 30 - arrow(left)} y1={70} x2={bx - 34} y2={70} stroke="#2563eb" strokeWidth={5} />
                  <path d={`M ${bx - 34} 63 L ${bx - 24} 70 L ${bx - 34} 77 Z`} fill="#2563eb" />
                  <text x={bx - 36 - arrow(left) / 2} y={60} textAnchor="middle" fontSize={10} fill="#2563eb">{left} N</text>
                </g>
              )}
              {right > 0 && (
                <g>
                  <line x1={bx + 30 + arrow(right)} y1={100} x2={bx + 34} y2={100} stroke="#dc2626" strokeWidth={5} />
                  <path d={`M ${bx + 34} 93 L ${bx + 24} 100 L ${bx + 34} 107 Z`} fill="#dc2626" />
                  <text x={bx + 36 + arrow(right) / 2} y={124} textAnchor="middle" fontSize={10} fill="#dc2626">{right} N</text>
                </g>
              )}
            </g>
          )
        })()}
        <text x={8} y={16} fontSize={11} className="fill-muted-foreground">🔵 Team Blue pushes →</text>
        <text x={392} y={16} fontSize={11} textAnchor="end" className="fill-muted-foreground">← Team Red pushes 🔴</text>
      </svg>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          🔵 Team Blue pushes right: <b>{left} N</b>
          <Slider value={[left]} min={0} max={100} step={5} onValueChange={([v]) => setLeft(v)} className="mt-1.5" aria-label="Team Blue force" />
        </label>
        <label className="block text-sm">
          🔴 Team Red pushes left: <b>{right} N</b>
          <Slider value={[right]} min={0} max={100} step={5} onValueChange={([v]) => setRight(v)} className="mt-1.5" aria-label="Team Red force" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Readout label="Net force" value={net === 0 ? '0 N' : `${Math.abs(net)} N ${net > 0 ? '→' : '←'}`} />
        <Readout label="Friction" value={friction ? `${FRICTION} N` : 'none'} />
        <Readout label="Speed" value={`${Math.abs(ui.v).toFixed(2)} m/s`} />
        <Readout label="Forces are" value={state === 'balanced' ? 'Balanced' : state === 'held' ? 'Held by friction' : 'Unbalanced'} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant={friction ? 'default' : 'outline'} onClick={() => setFriction((f) => !f)}>{friction ? '🟫 Rough floor (friction on)' : '🧊 Ice (no friction)'}</Button>
        <Button variant="ghost" onClick={reset}>Reset box</Button>
      </div>
      <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', state === 'unbalanced' ? 'bg-warn-soft' : 'bg-chem-soft')}>
        {state === 'balanced'
          ? ui.v === 0
            ? '⚖️ Balanced forces: the pushes cancel out, so the box stays still.'
            : '⚖️ Balanced forces: no net force. With no friction, the box keeps moving at the SAME speed!'
          : state === 'held'
            ? '🟫 The pushes are unequal, but friction is strong enough to hold the box still.'
            : `➡️ Unbalanced forces: the net force changes the box's speed, in the direction of the bigger push.`}
      </p>
    </LabFrame>
  )
}
