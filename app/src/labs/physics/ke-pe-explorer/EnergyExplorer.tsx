import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { G_EARTH } from '../_shared/dynamics'
import { kineticEnergy, potentialEnergy, speedFromDrop } from '../_shared/energy'

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0">{label}</span>
      <span className="h-4 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full transition-[width] duration-75" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} /></span>
      <span className="w-16 shrink-0 text-right font-mono tabular-nums">{value.toFixed(0)} J</span>
    </div>
  )
}

export default function EnergyExplorer() {
  const [m, setM] = useState(60)
  const [v, setV] = useState(5)
  const [dm, setDm] = useState(2)
  const [h, setH] = useState(10)
  const [t, setT] = useState(0)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const tFall = Math.sqrt((2 * h) / G_EARTH)
  const drop = () => {
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const tick = (now: number) => {
      // slowed down 2× so you can watch the bars
      const el = Math.min(tFall, (now - start) / 2000)
      setT(el)
      if (el < tFall) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const fallen = Math.min(h, 0.5 * G_EARTH * t * t)
  const height = h - fallen
  const speed = G_EARTH * t
  const E = potentialEnergy(dm, h)
  const ke = kineticEnergy(m, v)
  return (
    <LabFrame labId="ke-pe-explorer" title="Energy Explorer" subtitle="Kinetic energy depends on speed squared; potential energy on height. Falling turns one into the other." howTo={<p>Top: see how mass and speed change kinetic energy. Bottom: drop a ball and watch potential energy turn into kinetic energy.</p>}>
      <div className="rounded-2xl border p-4">
        <p className="font-heading text-lg font-semibold">🏃 Kinetic energy: KE = ½mv²</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Mass m = <b>{m} kg</b><Slider value={[m]} min={1} max={100} step={1} onValueChange={([x]) => setM(x)} className="mt-1" aria-label="mass" /></label>
          <label className="text-sm">Speed v = <b>{v} m/s</b><Slider value={[v]} min={0} max={20} step={1} onValueChange={([x]) => setV(x)} className="mt-1" aria-label="speed" /></label>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Readout label="KE" value={`${ke.toFixed(0)} J`} />
          <Readout label="Double the mass" value={`${kineticEnergy(2 * m, v).toFixed(0)} J (×2)`} />
          <Readout label="Double the speed" value={`${kineticEnergy(m, 2 * v).toFixed(0)} J (×4)`} />
        </div>
      </div>
      <div className="mt-4 grid gap-4 rounded-2xl border p-4 md:grid-cols-[140px_1fr]">
        <svg viewBox="0 0 140 240" className="mx-auto w-full max-w-[140px]" role="img" aria-label={`Ball at ${height.toFixed(1)} m moving at ${speed.toFixed(1)} m/s`}>
          <rect x={20} y={220} width={100} height={20} fill="#16a34a" opacity={0.4} />
          <line x1={120} y1={20} x2={120} y2={220} stroke="currentColor" strokeOpacity={0.3} />
          <text x={124} y={24} fontSize={9} fill="currentColor">{h} m</text>
          <circle cx={70} cy={220 - 10 - (height / 20) * 190} r={10} fill="#ef4444" />
        </svg>
        <div className="space-y-3">
          <p className="font-heading text-lg font-semibold">🍉 Drop it: PE = mgh turns into KE</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Mass <b>{dm} kg</b><Slider value={[dm]} min={1} max={10} step={1} onValueChange={([x]) => { setDm(x); setT(0) }} className="mt-1" aria-label="drop mass" /></label>
            <label className="text-sm">Height <b>{h} m</b><Slider value={[h]} min={1} max={20} step={1} onValueChange={([x]) => { setH(x); setT(0) }} className="mt-1" aria-label="drop height" /></label>
          </div>
          <Button onClick={drop}>⬇️ Drop</Button>
          <div className="space-y-1.5">
            <Bar label="Potential (mgh)" value={potentialEnergy(dm, height)} max={E} color="#6366f1" />
            <Bar label="Kinetic (½mv²)" value={kineticEnergy(dm, speed)} max={E} color="#f59e0b" />
            <Bar label="Total" value={potentialEnergy(dm, height) + kineticEnergy(dm, speed)} max={E} color="#10b981" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Height now" value={`${height.toFixed(1)} m`} />
            <Readout label="Speed now (landing speed)" value={`${speed.toFixed(1)} m/s (${speedFromDrop(h).toFixed(1)})`} />
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">As the ball falls, the potential energy it loses becomes kinetic energy, and the <b>total stays the same</b> (ignoring air resistance). Setting mgh = ½mv² gives v = √(2gh): the landing speed doesn't depend on the mass!</p>
    </LabFrame>
  )
}
