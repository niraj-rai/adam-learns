import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { frac, show } from '../_shared/fraction'
import { change, percentOf, round2 } from './model'

export default function PercentBar() {
  const [tab, setTab] = useState<'grid' | 'change'>('grid')
  return (
    <LabFrame labId="percent-bar" title="Percent Grid" subtitle="Per cent means ‘out of 100’. See percentages as fractions and decimals, and measure changes." howTo={<p>Grid: shade a percentage and see it as a fraction, a decimal and a share of an amount. Change: compare an old and a new value to find the percentage increase or decrease.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['grid', '💯 Hundred grid'], ['change', '📈 Percentage change']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'grid' ? <Grid /> : <Change />}
    </LabFrame>
  )
}

function Grid() {
  const [p, setP] = useState(35)
  const [x, setX] = useState(450)
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="grid w-60 grid-cols-10 gap-0.5 rounded-xl border bg-background p-1.5" role="img" aria-label={`${p} of 100 squares shaded`}>
        {Array.from({ length: 100 }, (_, i) => <span key={i} className={cn('aspect-square rounded-[2px]', i < p ? 'bg-chem' : 'bg-muted')} />)}
      </div>
      <div className="space-y-3">
        <label className="block text-sm">Percentage <b>{p}%</b><Slider value={[p]} min={0} max={100} step={1} onValueChange={([v]) => setP(v)} className="mt-1" aria-label="Percentage" /></label>
        <div className="grid grid-cols-3 gap-2">
          <Readout label="Percent" value={`${p}%`} />
          <Readout label="Fraction" value={`${p}/100${show(frac(p, 100)) !== `${p}/100` ? ` = ${show(frac(p, 100))}` : ''}`} />
          <Readout label="Decimal" value={`${p / 100}`} />
        </div>
        <label className="block text-sm">Amount <b>{x.toLocaleString('en-IN')}</b><Slider value={[x]} min={0} max={2000} step={10} onValueChange={([v]) => setX(v)} className="mt-1" aria-label="Amount" /></label>
        <Readout label={`${p}% of ${x.toLocaleString('en-IN')}`} value={`${p}/100 × ${x} = ${round2(percentOf(p, x))}`} />
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Handy benchmarks: 50% = ½, 25% = ¼, 10% = 1/10, 1% = 1/100. To find {p}% mentally, try building it from 10%s and 1%s: 10% of {x} is {round2(x / 10)}.</p>
      </div>
    </div>
  )
}

function Change() {
  const [a, setA] = useState(800)
  const [b, setB] = useState(1000)
  const c = change(a, b)
  return (
    <div className="space-y-3">
      <label className="block text-sm">Old price <b>₹{a}</b><Slider value={[a]} min={100} max={2000} step={50} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="Old price" /></label>
      <label className="block text-sm">New price <b>₹{b}</b><Slider value={[b]} min={100} max={2000} step={50} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="New price" /></label>
      <div className="space-y-1">
        <div className="h-6 rounded bg-sky-400/70" style={{ width: `${(a / 2000) * 100}%` }} />
        <div className={cn('h-6 rounded', c >= 0 ? 'bg-emerald-500/70' : 'bg-red-400/70')} style={{ width: `${(b / 2000) * 100}%` }} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="Change" value={`₹${b - a}`} />
        <Readout label={c >= 0 ? 'Percentage increase' : 'Percentage decrease'} value={`${b - a} ÷ ${a} × 100 = ${round2(Math.abs(c))}%`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Always divide by the <b>original</b> (old) value. Watch out: going from ₹800 to ₹1000 is a 25% increase, but going back from ₹1000 to ₹800 is only a 20% decrease, because the starting value is different.</p>
    </div>
  )
}
