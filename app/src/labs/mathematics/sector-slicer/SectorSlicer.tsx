import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { arcLength, sectorArea } from '../_shared/geometry'

const PRESETS = [
  { name: 'Pizza slice', emoji: '🍕', r: 14, deg: 45 },
  { name: 'Clock: 20 minutes', emoji: '🕒', r: 7, deg: 120 },
  { name: 'Wiper sweep', emoji: '🚗', r: 21, deg: 115 },
  { name: 'Semicircle', emoji: '🌓', r: 7, deg: 180 },
]

export default function SectorSlicer() {
  const [r, setR] = useState(14)
  const [deg, setDeg] = useState(45)
  const [usePi, setUsePi] = useState<'22/7' | '3.14'>('22/7')
  const PI = usePi === '22/7' ? 22 / 7 : 3.14
  const L = (deg / 360) * 2 * PI * r
  const A = (deg / 360) * PI * r * r
  const rad = (deg * Math.PI) / 180
  const cx = 150
  const cy = 130
  const R = 100
  const end = { x: cx + R * Math.cos(-rad), y: cy + R * Math.sin(-rad) }
  const large = deg > 180 ? 1 : 0
  return (
    <LabFrame labId="sector-slicer" title="Arcs and Sectors" subtitle="A sector is a slice of a circle. Its arc and area are the same fraction of the whole circle as its angle is of 360°." howTo={<p>Change the radius and the angle. See the arc length and sector area as a fraction of the whole circle.</p>}>
      <div className="flex flex-wrap gap-1">{PRESETS.map((p) => <button key={p.name} type="button" onClick={() => { setR(p.r); setDeg(p.deg) }} className="rounded-lg border-2 px-2.5 py-1 text-sm hover:bg-muted">{p.emoji} {p.name}</button>)}</div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 260" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Sector of ${deg} degrees`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} />
          {deg >= 360 ? <circle cx={cx} cy={cy} r={R} fill="#f59e0b" fillOpacity={0.35} stroke="#dc2626" strokeWidth={4} /> : <path d={`M${cx},${cy} L${cx + R},${cy} A${R},${R} 0 ${large},0 ${end.x},${end.y} Z`} fill="#f59e0b" fillOpacity={0.35} stroke="#f59e0b" strokeWidth={2} />}
          {deg < 360 && <path d={`M${cx + R},${cy} A${R},${R} 0 ${large},0 ${end.x},${end.y}`} fill="none" stroke="#dc2626" strokeWidth={4} />}
          <path d={`M${cx + 24},${cy} A24,24 0 ${large},0 ${cx + 24 * Math.cos(-rad)},${cy + 24 * Math.sin(-rad)}`} fill="none" stroke="currentColor" />
          <text x={cx + 30} y={cy - 8} fontSize={11} fill="currentColor">θ = {deg}°</text>
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="currentColor" /><text x={cx + R / 2} y={cy + 14} textAnchor="middle" fontSize={11} fill="currentColor">r = {r}</text>
          <text x={150} y={252} textAnchor="middle" fontSize={11} fill="currentColor">{deg}/360 of the circle</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Radius r = <b>{r} cm</b><Slider value={[r]} min={1} max={28} step={1} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="radius" /></label>
          <label className="block text-sm">Angle θ = <b>{deg}°</b><Slider value={[deg]} min={5} max={360} step={5} onValueChange={([v]) => setDeg(v)} className="mt-1" aria-label="angle" /></label>
          <div className="inline-flex rounded-lg border p-1 text-xs">{(['22/7', '3.14'] as const).map((k) => <button key={k} type="button" aria-pressed={usePi === k} onClick={() => setUsePi(k)} className={cn('rounded-md px-2 py-0.5', usePi === k ? 'bg-primary text-primary-foreground' : '')}>π ≈ {k}</button>)}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Arc length = θ/360 × 2πr" value={`${L.toFixed(2)} cm`} />
            <Readout label="Sector area = θ/360 × πr²" value={`${A.toFixed(2)} cm²`} />
            <Readout label="Whole circumference" value={`${(2 * PI * r).toFixed(2)} cm`} />
            <Readout label="Whole circle area" value={`${(PI * r * r).toFixed(2)} cm²`} />
          </div>
          <p className="text-xs text-muted-foreground">Exact (with true π): arc {arcLength(r, deg).toFixed(3)} cm, area {sectorArea(r, deg).toFixed(3)} cm².</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>sector</b> is the region between two radii and an arc; a <b>segment</b> is the region between a chord and an arc. Aryabhata (499 CE) gave π ≈ 62832/20000 = 3.1416, correct to four decimal places.</p>
    </LabFrame>
  )
}
