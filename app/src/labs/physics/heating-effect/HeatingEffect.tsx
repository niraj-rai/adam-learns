import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { APPLIANCES, currentFor, fuseBlows, heatShare, units, WIRES } from './model'

export default function HeatingEffect() {
  const [tab, setTab] = useState<'wire' | 'fuse'>('wire')
  return (
    <LabFrame labId="heating-effect" title="Heating Effect of Current" subtitle="Current makes wires hot. Useful in heaters and irons, dangerous when wires overload." howTo={<p>Tab 1: pass current through a copper wire and a nichrome wire joined in series. Which one glows? Tab 2: switch on appliances in a home and see when the fuse blows.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['wire', '🔥 Hot wire'], ['fuse', '🏠 Fuse box']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'wire' ? <HotWire /> : <FuseBox />}
    </LabFrame>
  )
}

function HotWire() {
  const [cells, setCells] = useState(0)
  const [share] = useState(() => heatShare(WIRES.map((w) => w.r)))
  const glow = (i: number) => Math.min(1, (cells / 4) ** 2 * share[i] * 1.1)
  const colour = (g: number) => (g < 0.05 ? '#94a3b8' : `hsl(${Math.round(40 - g * 40)} 100% ${Math.round(45 + g * 15)}%)`)
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 140" className="w-full rounded-2xl border bg-slate-900" role="img" aria-label={`${cells} cells; the nichrome wire ${glow(1) > 0.3 ? 'glows' : 'is dark'}, the copper wire stays cool`}>
        <rect x={20} y={40} width={360} height={60} fill="none" stroke="#475569" strokeWidth={2} />
        <line x1={60} y1={40} x2={190} y2={40} stroke={colour(glow(0))} strokeWidth={6} />
        <path d="M200 40 l8 -8 l8 16 l8 -16 l8 16 l8 -16 l8 16 l8 -16 l8 16 l8 -16 l8 8" fill="none" stroke={colour(glow(1))} strokeWidth={3} style={{ filter: glow(1) > 0.3 ? `drop-shadow(0 0 ${glow(1) * 8}px #f97316)` : 'none' }} />
        <text x={125} y={30} fontSize={10} textAnchor="middle" fill="#cbd5e1">thick copper</text>
        <text x={245} y={24} fontSize={10} textAnchor="middle" fill="#cbd5e1">thin nichrome</text>
        {Array.from({ length: cells }, (_, i) => (
          <g key={i} transform={`translate(${170 + i * 22} 100)`}>
            <rect x={-8} y={-12} width={16} height={24} fill="#0f172a" />
            <line x1={-4} y1={-10} x2={-4} y2={10} stroke="#e2e8f0" strokeWidth={2} />
            <line x1={4} y1={-5} x2={4} y2={5} stroke="#e2e8f0" strokeWidth={4} />
          </g>
        ))}
      </svg>
      <label className="block text-sm">Number of cells: <b>{cells}</b>
        <Slider value={[cells]} min={0} max={4} step={1} onValueChange={([v]) => setCells(v)} className="mt-1.5" aria-label="Number of cells" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="Share of heat: copper" value={`${(share[0] * 100).toFixed(1)}%`} />
        <Readout label="Share of heat: nichrome" value={`${(share[1] * 100).toFixed(1)}%`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The same current flows through both wires, but the thin <b>nichrome</b> wire has a much higher <b>resistance</b>, so almost all the heat is produced there (heat ∝ current² × resistance). That's why heaters, irons, toasters and geysers use nichrome coils, while the connecting wires are thick copper and stay cool. More cells → more current → much more heat.</p>
    </div>
  )
}

function FuseBox() {
  const [on, setOn] = useState<string[]>(['led', 'fan'])
  const [rating, setRating] = useState(15)
  const [blown, setBlown] = useState(false)
  const watts = APPLIANCES.filter((a) => on.includes(a.id)).map((a) => a.watts)
  const current = currentFor(watts)
  const toggle = (id: string) => {
    if (blown) return
    const next = on.includes(id) ? on.filter((x) => x !== id) : [...on, id]
    setOn(next)
    const i = currentFor(APPLIANCES.filter((a) => next.includes(a.id)).map((a) => a.watts))
    if (fuseBlows(i, rating)) { setBlown(true); sfx.wrong() }
  }
  const reset = () => { setBlown(false); setOn((o) => o.filter((id) => !['geyser', 'induction', 'ac', 'iron'].includes(id))) }
  const total = watts.reduce((s, w) => s + w, 0)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>Fuse / MCB rating:</span>
        {[5, 15].map((r) => <Button key={r} size="sm" variant={rating === r ? 'default' : 'outline'} disabled={blown} onClick={() => setRating(r)}>{r} A</Button>)}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {APPLIANCES.map((a) => (
          <button key={a.id} type="button" onClick={() => toggle(a.id)} aria-pressed={on.includes(a.id)} className={cn('rounded-xl border px-3 py-2 text-left text-sm', on.includes(a.id) && !blown ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', blown && 'opacity-60')}>
            {a.emoji} {a.name} <span className="text-muted-foreground">· {a.watts} W</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Readout label="Total power" value={blown ? '0 W' : `${total} W`} />
        <Readout label="Current (I = P ÷ 230 V)" value={blown ? '0 A' : `${current.toFixed(1)} A`} className={cn(!blown && current > rating * 0.8 && 'text-destructive')} />
        <Readout label="Energy in 1 hour" value={blown ? '0' : `${units(total, 1).toFixed(2)} units`} />
      </div>
      {blown ? (
        <div role="status" className="rounded-xl bg-warn-soft px-4 py-3 text-sm">
          💥 <b>The fuse blew!</b> The current went above {rating} A. The thin fuse wire (or the MCB switch) heated up and cut the circuit before the house wiring could overheat and start a fire.
          <Button size="sm" className="ml-2" onClick={reset}>Switch off heavy appliances and reset</Button>
        </div>
      ) : (
        <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Each appliance draws current. All the current passes through the fuse. Try switching on the geyser and induction cooktop together. Modern homes use an <b>MCB</b> (miniature circuit breaker), which trips like a fuse but can be reset.</p>
      )}
    </div>
  )
}
