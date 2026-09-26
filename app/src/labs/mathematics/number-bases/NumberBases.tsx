import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { sup } from '../_shared/number'
import { fromRoman, toBase, toRoman } from './model'

const BASES = [
  { b: 2, name: 'Binary (computers)' },
  { b: 5, name: 'Base 5 (one hand)' },
  { b: 10, name: 'Decimal (Indian place value)' },
  { b: 20, name: 'Base 20 (Maya)' },
  { b: 60, name: 'Base 60 (Babylon)' },
]

export default function NumberBases() {
  const [tab, setTab] = useState<'bases' | 'roman'>('bases')
  return (
    <LabFrame labId="number-bases" title="Number Systems Explorer" subtitle="The same number written in binary, Mayan base 20, Babylonian base 60 and Roman numerals." howTo={<p>Bases: choose a number and a base to see its place-value columns (each column is a power of the base). Roman: convert between our numerals and Roman ones.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['bases', '🔢 Place value bases'], ['roman', '🏛️ Roman numerals']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'bases' ? <Bases /> : <Roman />}
    </LabFrame>
  )
}

function Bases() {
  const [n, setN] = useState(2026)
  const [b, setB] = useState(2)
  const ds = toBase(n, b)
  return (
    <div className="space-y-3">
      <label className="block text-sm">Number <b>{n.toLocaleString('en-IN')}</b>
        <Slider value={[n]} min={0} max={5000} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Number" />
      </label>
      <div className="flex flex-wrap gap-1">
        {BASES.map((x) => (
          <button key={x.b} type="button" aria-pressed={b === x.b} onClick={() => setB(x.b)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', b === x.b ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-background p-3">
        <div className="flex gap-1.5">
          {ds.map((d, i) => {
            const k = ds.length - 1 - i
            return (
              <div key={i} className="min-w-14 rounded-xl border-2 border-chem/40 bg-chem-soft p-2 text-center">
                <p className="text-[11px] text-muted-foreground">{b}{sup(k)} = {(b ** k).toLocaleString('en-IN')}</p>
                <p className="font-mono text-2xl font-bold">{d}</p>
                <p className="text-[11px] text-muted-foreground">{(d * b ** k).toLocaleString('en-IN')}</p>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label={`${n} in base ${b}`} value={b <= 10 ? ds.join('') : ds.join(' | ')} />
        <Readout label="Check" value={ds.map((d, i) => `${d}×${b}${sup(ds.length - 1 - i)}`).join(' + ') + ` = ${n}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">In every place-value system, each column is a <b>power of the base</b>. {b === 2 ? 'Binary uses only 0 and 1, perfect for computer switches that are off or on.' : b === 60 ? 'We still use base 60 today: 60 seconds in a minute, 60 minutes in an hour, 360° in a circle.' : b === 20 ? 'The Maya counted on fingers and toes, and invented their own symbol for zero.' : b === 10 ? 'Our decimal system, with zero as a digit, developed in India and spread to the world through Arabic mathematicians.' : 'Counting on one hand gives groups of 5.'}</p>
    </div>
  )
}

function Roman() {
  const [n, setN] = useState(2026)
  const [r, setR] = useState('MCMXLVII')
  const back = fromRoman(r)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-2xl border bg-background p-4">
        <p className="text-sm font-semibold">Number → Roman</p>
        <Slider value={[n]} min={1} max={3999} step={1} onValueChange={([v]) => setN(v)} aria-label="Number" />
        <Readout label={`${n}`} value={toRoman(n)} />
      </div>
      <div className="space-y-2 rounded-2xl border bg-background p-4">
        <p className="text-sm font-semibold">Roman → Number</p>
        <input value={r} onChange={(e) => setR(e.target.value.toUpperCase().replace(/[^IVXLCDM]/g, ''))} aria-label="Roman numeral" className="w-full rounded-lg border-2 bg-background px-3 py-1.5 font-mono text-lg" />
        <Readout label={r || '—'} value={back ? `${back}` : 'Not a correctly written numeral'} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">Roman numerals have <b>no zero and no place value</b>: symbols are added (VI = 5 + 1) or subtracted (IV = 5 − 1). Try multiplying MCMXLVII by XLII without converting! Place value with zero made arithmetic so much easier that it replaced Roman numerals across Europe.</p>
    </div>
  )
}
