import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { mapToKm, paint, share, simplify } from './model'

export default function RatioMixer() {
  const [tab, setTab] = useState<'mix' | 'share' | 'map'>('mix')
  return (
    <LabFrame labId="ratio-mixer" title="Ratio Mixer" subtitle="Ratios compare parts. Mix paint, share money fairly, and read map scales." howTo={<p>Mix: change the parts of blue and yellow and see the shade. Share: split an amount in a ratio with a bar model. Map: use a scale to turn map centimetres into real kilometres.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['mix', '🎨 Mix paint'], ['share', '💰 Share'], ['map', '🗺️ Map scale']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'mix' ? <Mix /> : tab === 'share' ? <Share /> : <MapScale />}
    </LabFrame>
  )
}

const BLUE = '#2563eb'
const YELLOW = '#facc15'

function Mix() {
  const [b, setB] = useState(2)
  const [y, setY] = useState(3)
  const [total, setTotal] = useState(500)
  const [sb, sy] = simplify([b, y])
  const [mb, my] = share(total, [b, y])
  return (
    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
      <div className="space-y-2 text-center">
        <div className="mx-auto size-36 rounded-full border-4 border-background shadow-inner" style={{ background: paint(y / (b + y)) }} aria-label="Mixed colour" />
        <div className="flex justify-center gap-1">
          {Array.from({ length: b }, (_, i) => <span key={`b${i}`} className="size-4 rounded-sm" style={{ background: BLUE }} />)}
          {Array.from({ length: y }, (_, i) => <span key={`y${i}`} className="size-4 rounded-sm" style={{ background: YELLOW }} />)}
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-sm">Blue parts <b>{b}</b><Slider value={[b]} min={1} max={10} step={1} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="Blue parts" /></label>
        <label className="block text-sm">Yellow parts <b>{y}</b><Slider value={[y]} min={1} max={10} step={1} onValueChange={([v]) => setY(v)} className="mt-1" aria-label="Yellow parts" /></label>
        <label className="block text-sm">Total paint <b>{total} mL</b><Slider value={[total]} min={100} max={2000} step={100} onValueChange={([v]) => setTotal(v)} className="mt-1" aria-label="Total paint" /></label>
        <div className="grid gap-2 sm:grid-cols-3">
          <Readout label="Ratio" value={`${b} : ${y}${sb !== b ? ` = ${sb} : ${sy}` : ''}`} />
          <Readout label="Blue" value={`${Math.round(mb)} mL (${b}/${b + y})`} />
          <Readout label="Yellow" value={`${Math.round(my)} mL (${y}/${b + y})`} />
        </div>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Try 2 : 3, then 4 : 6, then 6 : 9. Same shade every time! They are <b>equivalent ratios</b>, like equivalent fractions. Changing the total paint changes the amounts, not the colour.</p>
      </div>
    </div>
  )
}

const PEOPLE = [{ n: 'Adam', c: '#6366f1' }, { n: 'Meera', c: '#10b981' }, { n: 'Kabir', c: '#f59e0b' }]

function Share() {
  const [total, setTotal] = useState(1200)
  const [parts, setParts] = useState([2, 3, 5])
  const amounts = share(total, parts)
  const sum = parts.reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-3">
      <label className="block text-sm">Prize money <b>₹{total.toLocaleString('en-IN')}</b><Slider value={[total]} min={100} max={5000} step={100} onValueChange={([v]) => setTotal(v)} className="mt-1" aria-label="Total" /></label>
      <div className="grid gap-2 sm:grid-cols-3">
        {PEOPLE.map((p, i) => (
          <label key={p.n} className="text-sm">{p.n}'s parts <b>{parts[i]}</b><Slider value={[parts[i]]} min={1} max={6} step={1} onValueChange={([v]) => setParts((ps) => ps.map((x, k) => (k === i ? v : x)))} className="mt-1" aria-label={`${p.n} parts`} /></label>
        ))}
      </div>
      <div className="flex h-12 overflow-hidden rounded-xl border">
        {parts.flatMap((n, i) => Array.from({ length: n }, (_, k) => (
          <div key={`${i}-${k}`} className="flex flex-1 items-center justify-center border-r border-background text-[10px] font-semibold text-white last:border-0" style={{ background: PEOPLE[i].c }}>₹{Math.round(total / sum).toLocaleString('en-IN')}</div>
        )))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {PEOPLE.map((p, i) => <Readout key={p.n} label={p.n} value={`${parts[i]} × ₹${Math.round((total / sum) * 100) / 100} = ₹${Math.round(amounts[i] * 100) / 100}`} />)}
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Ratio {parts.join(' : ')} has {sum} parts in total. One part is ₹{total} ÷ {sum} = ₹{Math.round((total / sum) * 100) / 100}. Multiply by each person's parts.</p>
    </div>
  )
}

const SCALES = [25000, 50000, 100000, 1000000]

function MapScale() {
  const [s, setS] = useState(50000)
  const [cm, setCm] = useState(4)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {SCALES.map((x) => <button key={x} type="button" aria-pressed={s === x} onClick={() => setS(x)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', s === x ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>1 : {x.toLocaleString('en-IN')}</button>)}
      </div>
      <label className="block text-sm">Distance on the map <b>{cm} cm</b><Slider value={[cm]} min={0.5} max={20} step={0.5} onValueChange={([v]) => setCm(v)} className="mt-1" aria-label="Map distance" /></label>
      <div className="rounded-2xl border bg-background p-3">
        <div className="h-3 rounded bg-chem" style={{ width: `${(cm / 20) * 100}%` }} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="1 cm on the map is" value={`${(s / 100).toLocaleString('en-IN')} m = ${s / 100000} km`} />
        <Readout label={`${cm} cm on the map is`} value={`${cm} × ${s.toLocaleString('en-IN')} cm = ${mapToKm(cm, s)} km`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A scale of 1 : {s.toLocaleString('en-IN')} means 1 cm on the map stands for {s.toLocaleString('en-IN')} cm in real life. Divide by 100 for metres, and by 1,00,000 for kilometres.</p>
    </div>
  )
}
