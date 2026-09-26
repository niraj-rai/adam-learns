import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { cuboidVolume, cylinderVolume, litres } from './model'

export default function VolumeBuilder() {
  const [tab, setTab] = useState<'cuboid' | 'cylinder' | 'tank'>('cuboid')
  return (
    <LabFrame labId="volume-builder" title="Volume Builder" subtitle="Volume counts unit cubes: layers of (base area) stacked up to the height." howTo={<p>Cuboid: build a box from unit cubes. Cylinder: stack circular layers. Tank: find how many litres a water tank holds.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['cuboid', '📦 Cuboid'], ['cylinder', '🥫 Cylinder'], ['tank', '💧 Water tank']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'cuboid' ? <Cuboid /> : tab === 'cylinder' ? <Cylinder /> : <Tank />}
    </LabFrame>
  )
}

function Iso({ l, b, h, layers }: { l: number; b: number; h: number; layers: number }) {
  const s = Math.min(22, 150 / Math.max(l, b, h))
  const W = 300
  const cy = 30 + h * s
  const P = (x: number, y: number, z: number) => `${W / 2 + (x - y) * s * 0.866},${cy + (x + y) * s * 0.5 - z * s}`
  const tiles: { p: string; f: string }[] = []
  const top = Math.min(layers, h)
  for (let i = 0; i < l; i++) for (let j = 0; j < b; j++) tiles.push({ p: [P(i, j, top), P(i + 1, j, top), P(i + 1, j + 1, top), P(i, j + 1, top)].join(' '), f: '#fcd34d' })
  for (let j = 0; j < b; j++) for (let z = 0; z < top; z++) tiles.push({ p: [P(l, j, z), P(l, j + 1, z), P(l, j + 1, z + 1), P(l, j, z + 1)].join(' '), f: '#f59e0b' })
  for (let i = 0; i < l; i++) for (let z = 0; z < top; z++) tiles.push({ p: [P(i, b, z), P(i + 1, b, z), P(i + 1, b, z + 1), P(i, b, z + 1)].join(' '), f: '#d97706' })
  const ghost = [P(0, 0, h), P(l, 0, h), P(l, b, h), P(0, b, h)].join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${cy + (l + b) * s * 0.5 + 20}`} className="max-h-80 w-full rounded-2xl border bg-background" role="img" aria-label={`${l} by ${b} by ${h} box, ${top} layers filled`}>
      <polygon points={ghost} fill="none" stroke="#94a3b8" strokeDasharray="4 3" />
      {tiles.map((t, i) => <polygon key={i} points={t.p} fill={t.f} stroke="#78350f" strokeWidth={0.6} />)}
    </svg>
  )
}

function Cuboid() {
  const [l, setL] = useState(5)
  const [b, setB] = useState(3)
  const [h, setH] = useState(4)
  const [layers, setLayers] = useState(4)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <Iso l={l} b={b} h={h} layers={layers} />
      <div className="space-y-2">
        <label className="block text-sm">Length <b>{l}</b><Slider value={[l]} min={1} max={8} step={1} onValueChange={([v]) => setL(v)} className="mt-1" aria-label="length" /></label>
        <label className="block text-sm">Breadth <b>{b}</b><Slider value={[b]} min={1} max={8} step={1} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="breadth" /></label>
        <label className="block text-sm">Height <b>{h}</b><Slider value={[h]} min={1} max={8} step={1} onValueChange={([v]) => { setH(v); setLayers(v) }} className="mt-1" aria-label="height" /></label>
        <label className="block text-sm">Layers filled <b>{Math.min(layers, h)}</b><Slider value={[Math.min(layers, h)]} min={1} max={h} step={1} onValueChange={([v]) => setLayers(v)} className="mt-1" aria-label="layers" /></label>
        <Readout label="One layer" value={`${l} × ${b} = ${l * b} cubes`} />
        <Readout label="Volume" value={`${l * b} × ${Math.min(layers, h)} = ${l * b * Math.min(layers, h)}${layers >= h ? ` = l × b × h = ${cuboidVolume(l, b, h)}` : ''} cubic units`} />
      </div>
    </div>
  )
}

function Cylinder() {
  const [r, setR] = useState(7)
  const [h, setH] = useState(10)
  const base = Math.PI * r * r
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <svg viewBox="0 0 300 260" className="max-h-80 w-full rounded-2xl border bg-background" role="img" aria-label={`Cylinder with radius ${r} and height ${h}`}>
        {Array.from({ length: h }, (_, i) => {
          const y = 230 - i * (180 / h)
          const rx = 10 + r * 12
          return <ellipse key={i} cx={150} cy={y} rx={rx} ry={rx * 0.3} fill={i % 2 ? '#93c5fd' : '#60a5fa'} stroke="#1e3a8a" strokeWidth={0.5} />
        })}
      </svg>
      <div className="space-y-2">
        <label className="block text-sm">Radius <b>{r} cm</b><Slider value={[r]} min={1} max={10} step={1} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="radius" /></label>
        <label className="block text-sm">Height <b>{h} cm</b><Slider value={[h]} min={1} max={20} step={1} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="height" /></label>
        <Readout label="Base area πr²" value={`${base.toFixed(2)} cm²`} />
        <Readout label="Volume πr²h" value={`${cylinderVolume(r, h).toFixed(1)} cm³ = ${litres(cylinderVolume(r, h)).toFixed(3)} L`} />
        <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">Like a stack of coins: each layer is a circle of area πr², and there are h layers. Any prism works the same way: <b>volume = base area × height</b>.</p>
      </div>
    </div>
  )
}

function Tank() {
  const [l, setL] = useState(100)
  const [b, setB] = useState(50)
  const [h, setH] = useState(40)
  const v = cuboidVolume(l, b, h)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Length <b>{l} cm</b><Slider value={[l]} min={20} max={200} step={10} onValueChange={([x]) => setL(x)} className="mt-1" aria-label="tank length" /></label>
        <label className="text-sm">Breadth <b>{b} cm</b><Slider value={[b]} min={20} max={200} step={10} onValueChange={([x]) => setB(x)} className="mt-1" aria-label="tank breadth" /></label>
        <label className="text-sm">Height <b>{h} cm</b><Slider value={[h]} min={20} max={200} step={10} onValueChange={([x]) => setH(x)} className="mt-1" aria-label="tank height" /></label>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Readout label="Volume" value={`${v.toLocaleString('en-IN')} cm³`} />
        <Readout label="Capacity" value={`${litres(v).toLocaleString('en-IN')} litres`} />
        <Readout label="Buckets (10 L each)" value={`${Math.ceil(litres(v) / 10)}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>1 litre = 1000 cm³</b> (a 10 cm × 10 cm × 10 cm cube). And 1 m³ = 1000 litres. Indian city water planning allows about 135 litres per person per day.</p>
    </div>
  )
}
