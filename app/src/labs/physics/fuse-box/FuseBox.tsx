import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { FUSES, heat } from '../_shared/circuits'

const MAINS = 230
const APPLIANCES = [
  { id: 'fan', name: 'Ceiling fan', emoji: '🌀', W: 75 },
  { id: 'tv', name: 'TV', emoji: '📺', W: 120 },
  { id: 'fridge', name: 'Fridge', emoji: '🧊', W: 200 },
  { id: 'iron', name: 'Iron', emoji: '👔', W: 1000 },
  { id: 'kettle', name: 'Kettle', emoji: '🫖', W: 1500 },
  { id: 'ac', name: 'Air conditioner', emoji: '❄️', W: 1800 },
  { id: 'geyser', name: 'Water heater', emoji: '🚿', W: 2000 },
]

export default function FuseBox() {
  const [on, setOn] = useState<string[]>(['fan', 'tv'])
  const [fuse, setFuse] = useState(10)
  const [shorted, setShorted] = useState(false)
  const [tripped, setTripped] = useState(false)
  const [t, setT] = useState(60)
  const P = APPLIANCES.filter((a) => on.includes(a.id)).reduce((s, a) => s + a.W, 0)
  const I = shorted ? 200 : P / MAINS
  const over = I > fuse
  const toggle = (id: string) => { if (tripped) return; setOn((x) => { const n = x.includes(id) ? x.filter((y) => y !== id) : [...x, id]; const nI = APPLIANCES.filter((a) => n.includes(a.id)).reduce((s, a) => s + a.W, 0) / MAINS; if (nI > fuse) { setTripped(true); sfx.wrong() } return n }) }
  const short = () => { setShorted(true); setTripped(true); sfx.wrong() }
  const reset = () => { setTripped(false); setShorted(false); setOn((x) => (P / MAINS > fuse ? [] : x)) }
  const heaterR = MAINS * MAINS / 2000
  const heaterI = 2000 / MAINS
  return (
    <LabFrame labId="fuse-box" title="Power, Heat and Fuses" subtitle="P = VI and H = I²Rt. A fuse or MCB cuts the supply before too much current overheats the wires." howTo={<p>Switch appliances on. Watch the total power and current. Choose a fuse rating, then try overloading the circuit or causing a short circuit.</p>}>
      <div className="grid gap-2 sm:grid-cols-4">{APPLIANCES.map((a) => <button key={a.id} type="button" aria-pressed={on.includes(a.id)} disabled={tripped} onClick={() => toggle(a.id)} className={cn('rounded-xl border-2 p-2 text-left text-sm', on.includes(a.id) && !tripped ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', tripped && 'opacity-60')}>{a.emoji} {a.name}<span className="block text-xs text-muted-foreground">{a.W} W</span></button>)}</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Fuse / MCB rating <b>{fuse} A</b><Slider value={[FUSES.indexOf(fuse)]} min={0} max={FUSES.length - 1} step={1} onValueChange={([v]) => { setFuse(FUSES[v]); setTripped(false) }} className="mt-1" aria-label="fuse rating" /></label>
        <div className="flex flex-wrap items-end gap-2"><Button variant="destructive" onClick={short} disabled={tripped}>⚡ Short circuit</Button><Button variant="outline" onClick={reset}>🔄 Reset MCB</Button></div>
      </div>
      <div className={cn('mt-3 rounded-2xl border-2 p-4', tripped ? 'border-destructive bg-destructive/10' : 'border-success/50 bg-success-soft')}>
        <p className="font-heading text-lg font-semibold">{tripped ? (shorted ? '💥 Short circuit! The MCB tripped instantly.' : '🔌 Overload! The fuse blew / MCB tripped.') : '✅ Supply on'}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Readout label="Total power P" value={`${P} W`} />
          <Readout label="Current I = P ÷ V" value={shorted ? 'Very large!' : `${(P / MAINS).toFixed(2)} A`} />
          <Readout label="Compared with fuse" value={tripped ? 'Too high: cut off' : over ? 'Too high' : `OK (below ${fuse} A)`} />
        </div>
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">🔥 Heating effect in a 2000 W water heater</p>
        <label className="mt-2 block text-sm">Time switched on <b>{t} s</b><Slider value={[t]} min={10} max={600} step={10} onValueChange={([v]) => setT(v)} className="mt-1" aria-label="time on" /></label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Readout label="R = V² ÷ P" value={`${heaterR.toFixed(1)} Ω`} />
          <Readout label="I = P ÷ V" value={`${heaterI.toFixed(2)} A`} />
          <Readout label="Heat H = I²Rt" value={`${(heat(heaterI, heaterR, t) / 1000).toFixed(0)} kJ`} />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Joule's law: heat produced H = I²Rt, so doubling the current makes four times the heat. Indian homes get 230 V AC. Wires have live (red/brown), neutral (black/blue) and earth (green) conductors; the <b>earth wire</b> protects you if a metal appliance becomes live. A <b>fuse</b> melts, and an <b>MCB</b> switches off, when the current is too high from an overload or a short circuit.</p>
    </LabFrame>
  )
}
