import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { cuboidSA, cylinderCSA, cylinderTSA } from './model'

export default function SurfaceArea() {
  const [tab, setTab] = useState<'cuboid' | 'cylinder'>('cuboid')
  return (
    <LabFrame labId="surface-area" title="Surface Area Unfolded" subtitle="Unfold a solid into its net: the surface area is the area of all the faces added together." howTo={<p>Change the measurements and watch the net. Matching colours show faces that come in equal pairs.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['cuboid', '📦 Cuboid'], ['cylinder', '🥫 Cylinder']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'cuboid' ? <Cuboid /> : <Cylinder />}
    </LabFrame>
  )
}

function Cuboid() {
  const [l, setL] = useState(5)
  const [b, setB] = useState(3)
  const [h, setH] = useState(2)
  const k = Math.min(22, 300 / (2 * b + 2 * h), 420 / (l + 2 * b))
  const x0 = 20 + b * k
  const rect = (x: number, y: number, w: number, hh: number, fill: string, label: string) => (
    <g>
      <rect x={x} y={y} width={w} height={hh} fill={fill} fillOpacity={0.35} stroke="#334155" />
      <text x={x + w / 2} y={y + hh / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">{label}</text>
    </g>
  )
  let y = 10
  const top = y
  y += b * k
  const front = y
  y += h * k
  const bottom = y
  y += b * k
  const back = y
  y += h * k
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <svg viewBox={`0 0 ${40 + (l + 2 * b) * k} ${y + 10}`} className="max-h-96 w-full rounded-2xl border bg-background" role="img" aria-label={`Net of a ${l} by ${b} by ${h} cuboid`}>
        {rect(x0, top, l * k, b * k, '#6366f1', `${l}×${b}`)}
        {rect(x0, front, l * k, h * k, '#f59e0b', `${l}×${h}`)}
        {rect(x0, bottom, l * k, b * k, '#6366f1', `${l}×${b}`)}
        {rect(x0, back, l * k, h * k, '#f59e0b', `${l}×${h}`)}
        {rect(x0 - b * k, front, b * k, h * k, '#10b981', `${b}×${h}`)}
        {rect(x0 + l * k, front, b * k, h * k, '#10b981', `${b}×${h}`)}
      </svg>
      <div className="space-y-2">
        <label className="block text-sm">Length l = <b>{l}</b><Slider value={[l]} min={1} max={10} step={1} onValueChange={([v]) => setL(v)} className="mt-1" aria-label="length" /></label>
        <label className="block text-sm">Breadth b = <b>{b}</b><Slider value={[b]} min={1} max={8} step={1} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="breadth" /></label>
        <label className="block text-sm">Height h = <b>{h}</b><Slider value={[h]} min={1} max={8} step={1} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="height" /></label>
        <Readout label="Surface area" value={`2(${l * b} + ${b * h} + ${h * l}) = ${cuboidSA(l, b, h)} sq units`} />
        <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">Six faces in three matching pairs: top and bottom, front and back, left and right. So SA = <b>2(lb + bh + hl)</b>. For a cube of side a: 6a².</p>
      </div>
    </div>
  )
}

function Cylinder() {
  const [r, setR] = useState(3)
  const [h, setH] = useState(6)
  const C = 2 * Math.PI * r
  const k = Math.min(14, 440 / C, 280 / (h + 4 * r))
  const W = C * k
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <svg viewBox={`0 0 ${W + 40} ${(h + 4 * r) * k + 20}`} className="max-h-96 w-full rounded-2xl border bg-background" role="img" aria-label={`Net of a cylinder with radius ${r} and height ${h}`}>
        <circle cx={20 + W / 2} cy={10 + r * k} r={r * k} fill="#6366f1" fillOpacity={0.35} stroke="#334155" />
        <rect x={20} y={10 + 2 * r * k} width={W} height={h * k} fill="#f59e0b" fillOpacity={0.35} stroke="#334155" />
        <circle cx={20 + W / 2} cy={10 + (2 * r + h + r) * k} r={r * k} fill="#6366f1" fillOpacity={0.35} stroke="#334155" />
        <text x={20 + W / 2} y={10 + (2 * r + h / 2) * k + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">2πr × h = {C.toFixed(1)} × {h}</text>
      </svg>
      <div className="space-y-2">
        <label className="block text-sm">Radius r = <b>{r}</b><Slider value={[r]} min={1} max={7} step={1} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="radius" /></label>
        <label className="block text-sm">Height h = <b>{h}</b><Slider value={[h]} min={1} max={15} step={1} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="height" /></label>
        <Readout label="Curved surface 2πrh" value={`${cylinderCSA(r, h).toFixed(2)} sq units`} />
        <Readout label="Total 2πr(r + h)" value={`${cylinderTSA(r, h).toFixed(2)} sq units`} />
        <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">Peel the label off a tin: it's a <b>rectangle</b> as long as the circumference (2πr) and as tall as the tin (h). Add the two circular ends, πr² each.</p>
      </div>
    </div>
  )
}
