import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'

type Dir = 'up' | 'down' | 'left' | 'right' | 'in' | 'out'

/** Fleming's left-hand rule: F = I × B (as a cross product of unit directions). */
function force(field: 'right' | 'left', current: 'in' | 'out'): Dir {
  // B along ±x, I along ±z (out of page = +z). F = I × B.
  const b = field === 'right' ? 1 : -1
  const i = current === 'out' ? 1 : -1
  // (0,0,i) × (b,0,0) = (0, i*b, 0) → +y is up
  return i * b > 0 ? 'up' : 'down'
}

export default function MotorLab() {
  const [field, setField] = useState<'right' | 'left'>('right')
  const [current, setCurrent] = useState<'in' | 'out'>('out')
  const [I, setI] = useState(2)
  const [running, setRunning] = useState(false)
  const [angle, setAngle] = useState(0)
  const raf = useRef(0)
  const F = force(field, current)
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setAngle((a) => (a + dt * I * 90) % 360)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [running, I])
  const c = Math.cos((angle * Math.PI) / 180)
  return (
    <LabFrame labId="motor-lab" title="Force on a Current" subtitle="A current-carrying wire in a magnetic field feels a force. That push spins every electric motor." howTo={<p>Set the direction of the magnetic field and the current, and predict the force with Fleming's left-hand rule. Then run the motor.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div>
          <svg viewBox="0 0 300 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Force on the wire is ${F}`}>
            <rect x={10} y={40} width={50} height={120} fill={field === 'right' ? '#ef4444' : '#3b82f6'} /><text x={35} y={105} textAnchor="middle" fontSize={20} fill="white" fontWeight={700}>{field === 'right' ? 'N' : 'S'}</text>
            <rect x={240} y={40} width={50} height={120} fill={field === 'right' ? '#3b82f6' : '#ef4444'} /><text x={265} y={105} textAnchor="middle" fontSize={20} fill="white" fontWeight={700}>{field === 'right' ? 'S' : 'N'}</text>
            {[70, 100, 130].map((y) => <line key={y} x1={65} y1={y} x2={235} y2={y} stroke="#64748b" strokeDasharray="5 4" markerEnd={`url(#ml-${field})`} />)}
            <defs>{(['right', 'left'] as const).map((d) => <marker key={d} id={`ml-${d}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient={d === 'right' ? 0 : 180}><path d="M0,0 L8,4 L0,8 Z" fill="#64748b" /></marker>)}</defs>
            <circle cx={150} cy={100} r={16} fill="#f59e0b" stroke="#78350f" strokeWidth={2} />
            {current === 'out' ? <circle cx={150} cy={100} r={4} fill="#78350f" /> : <path d="M142,92 l16,16 M158,92 l-16,16" stroke="#78350f" strokeWidth={3} />}
            <line x1={150} y1={F === 'up' ? 80 : 120} x2={150} y2={F === 'up' ? 25 : 175} stroke="#16a34a" strokeWidth={5} />
            <path d={F === 'up' ? 'M150,15 l-9,14 h18 z' : 'M150,185 l-9,-14 h18 z'} fill="#16a34a" />
            <text x={162} y={F === 'up' ? 40 : 170} fontSize={12} fill="#16a34a" fontWeight={700}>force</text>
          </svg>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setField((f) => (f === 'right' ? 'left' : 'right'))}>🔄 Flip magnets</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrent((c2) => (c2 === 'out' ? 'in' : 'out'))}>🔄 Reverse current</Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="Field" value={field === 'right' ? 'Left → right' : 'Right → left'} />
            <Readout label="Current" value={current === 'out' ? 'Out of page •' : 'Into page ×'} />
            <Readout label="Force" value={F === 'up' ? '⬆️ Up' : '⬇️ Down'} />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm"><b>Fleming's left-hand rule:</b> hold your first finger, second finger and thumb at right angles. <b>F</b>irst finger = <b>F</b>ield, se<b>C</b>ond finger = <b>C</b>urrent, thu<b>M</b>b = <b>M</b>otion (force). Reversing either the field or the current reverses the force.</p>
          <div className="rounded-2xl border p-3">
            <p className="font-semibold">⚙️ Simple DC motor</p>
            <svg viewBox="0 0 200 110" className="mt-1 w-full" role="img" aria-label="A rotating motor coil">
              <rect x={5} y={20} width={30} height={70} fill="#ef4444" /><rect x={165} y={20} width={30} height={70} fill="#3b82f6" />
              <line x1={100 - 55 * c} y1={40} x2={100 + 55 * c} y2={40} stroke="#b45309" strokeWidth={5} />
              <line x1={100 - 55 * c} y1={70} x2={100 + 55 * c} y2={70} stroke="#b45309" strokeWidth={5} />
              <line x1={100 - 55 * c} y1={40} x2={100 - 55 * c} y2={70} stroke="#b45309" strokeWidth={5} />
              <line x1={100 + 55 * c} y1={40} x2={100 + 55 * c} y2={70} stroke="#b45309" strokeWidth={5} />
              <circle cx={100} cy={96} r={8} fill="#a8a29e" stroke="#44403c" />
            </svg>
            <label className="block text-sm">Current <b>{I} A</b><Slider value={[I]} min={1} max={5} step={1} onValueChange={([v]) => setI(v)} className="mt-1" aria-label="motor current" /></label>
            <Button className="mt-2" size="sm" onClick={() => setRunning((r) => !r)}>{running ? '⏸ Stop' : '▶ Run motor'}</Button>
            <p className="mt-2 text-xs text-muted-foreground">The two sides of the coil carry current in opposite directions, so one is pushed up and the other down: the coil turns. A <b>split-ring commutator</b> reverses the current every half turn so it keeps turning the same way. More current or a stronger magnet makes it spin faster.</p>
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Motors are in fans, mixers, washing machines, electric scooters and the Vande Bharat trains. The reverse effect, moving a wire in a magnetic field to produce a current (<b>electromagnetic induction</b>), is how generators in power stations make electricity.</p>
    </LabFrame>
  )
}
