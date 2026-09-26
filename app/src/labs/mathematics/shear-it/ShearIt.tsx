import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { parallelogramArea, trapeziumArea, triangleArea } from './model'

type Shape = 'parallelogram' | 'triangle' | 'trapezium'
const K = 26
const OX = 30
const OY = 200
const P = (pts: [number, number][], dx = 0) => pts.map(([x, y]) => `${OX + (x + dx) * K},${OY - y * K}`).join(' ')

export default function ShearIt() {
  const [shape, setShape] = useState<Shape>('parallelogram')
  const [b, setB] = useState(6)
  const [a, setA] = useState(3)
  const [h, setH] = useState(4)
  const [s, setS] = useState(2)
  const [show, setShow] = useState(false)
  const area = shape === 'parallelogram' ? parallelogramArea(b, h) : shape === 'triangle' ? triangleArea(b, h) : trapeziumArea(a, b, h)
  return (
    <LabFrame labId="shear-it" title="Cut and Rearrange" subtitle="Every area formula comes from cutting and moving pieces into a rectangle." howTo={<p>Pick a shape and change its measurements. Press the rearrange button to see how it turns into a rectangle or parallelogram you already know.</p>}>
      <div className="mb-3 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {(['parallelogram', 'triangle', 'trapezium'] as const).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={shape === k} onClick={() => { setShape(k); setShow(false) }} className={cn('rounded-md px-3 py-1 capitalize', shape === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{k}</button>
        ))}
      </div>
      <svg viewBox="0 0 520 220" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${shape} with area ${area} square units`}>
        {Array.from({ length: 20 }, (_, i) => <line key={`v${i}`} x1={OX + i * K} y1={OY - 7 * K} x2={OX + i * K} y2={OY} stroke="currentColor" strokeOpacity={0.07} />)}
        {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1={OX} y1={OY - i * K} x2={OX + 19 * K} y2={OY - i * K} stroke="currentColor" strokeOpacity={0.07} />)}
        {shape === 'parallelogram' && (
          <>
            <polygon points={P([[0, 0], [b, 0], [b + s, h], [s, h]])} fill="#6366f1" fillOpacity={show ? 0.08 : 0.25} stroke="#6366f1" strokeWidth={2} />
            {show && (
              <>
                <polygon points={P([[s, 0], [b + s, 0], [b + s, h], [s, h]])} fill="#6366f1" fillOpacity={0.2} stroke="#6366f1" strokeDasharray="4 3" />
                <polygon points={P([[0, 0], [s, 0], [s, h]], b)} fill="#f59e0b" fillOpacity={0.4} stroke="#f59e0b" strokeWidth={2} />
                <polygon points={P([[0, 0], [s, 0], [s, h]])} fill="none" stroke="#f59e0b" strokeDasharray="4 3" />
              </>
            )}
            <line x1={OX + s * K} y1={OY} x2={OX + s * K} y2={OY - h * K} stroke="#ef4444" strokeDasharray="3 3" />
          </>
        )}
        {shape === 'triangle' && (
          <>
            <polygon points={P([[0, 0], [b, 0], [s, h]])} fill="#10b981" fillOpacity={0.3} stroke="#10b981" strokeWidth={2} />
            {show && <polygon points={P([[b, 0], [b + s, h], [s, h]])} fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />}
            <line x1={OX + s * K} y1={OY} x2={OX + s * K} y2={OY - h * K} stroke="#ef4444" strokeDasharray="3 3" />
          </>
        )}
        {shape === 'trapezium' && (
          <>
            <polygon points={P([[0, 0], [b, 0], [s + a, h], [s, h]])} fill="#ec4899" fillOpacity={0.3} stroke="#ec4899" strokeWidth={2} />
            {show && <polygon points={P([[b, 0], [s + a, h], [s + a + b, h], [b + a, 0]].map(([x, y]) => [x, y]) as [number, number][])} fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />}
            <line x1={OX + s * K} y1={OY} x2={OX + s * K} y2={OY - h * K} stroke="#ef4444" strokeDasharray="3 3" />
          </>
        )}
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {shape === 'trapezium' && <label className="text-sm">Top a = <b>{a}</b><Slider value={[a]} min={1} max={6} step={1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="top side" /></label>}
        <label className="text-sm">Base = <b>{b}</b><Slider value={[b]} min={2} max={8} step={1} onValueChange={([v]) => { setB(v); if (s > v) setS(v) }} className="mt-1" aria-label="base" /></label>
        <label className="text-sm">Height = <b>{h}</b><Slider value={[h]} min={1} max={6} step={1} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="height" /></label>
        <label className="text-sm">Slant = <b>{s}</b><Slider value={[s]} min={0} max={Math.min(4, b)} step={1} onValueChange={([v]) => setS(v)} className="mt-1" aria-label="slant" /></label>
      </div>
      <button type="button" onClick={() => setShow((v) => !v)} className="mt-3 rounded-lg border-2 border-chem bg-chem-soft px-3 py-1.5 text-sm font-semibold">{show ? 'Hide the rearrangement' : '✂️ Rearrange'}</button>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Formula" value={shape === 'parallelogram' ? 'base × height' : shape === 'triangle' ? '½ × base × height' : '½ × (a + b) × height'} />
        <Readout label="Area" value={shape === 'parallelogram' ? `${b} × ${h} = ${area} sq units` : shape === 'triangle' ? `½ × ${b} × ${h} = ${area} sq units` : `½ × (${a} + ${b}) × ${h} = ${area} sq units`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {shape === 'parallelogram' && 'Cut the orange triangle off one end and slide it to the other: the parallelogram becomes a rectangle with the same base and height. Changing the slant never changes the area!'}
        {shape === 'triangle' && 'Two copies of any triangle fit together to make a parallelogram with the same base and height. So a triangle is exactly half: ½ × base × height.'}
        {shape === 'trapezium' && 'Two copies of a trapezium, one turned upside down, make a parallelogram with base (a + b). Half of it is the trapezium: ½ × (a + b) × h.'}
        {' '}The height is always measured at right angles to the base (the red dashed line).
      </p>
    </LabFrame>
  )
}
