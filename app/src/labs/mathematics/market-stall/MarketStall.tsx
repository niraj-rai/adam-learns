import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { money } from '../interest-growth/model'
import { afterDiscount, ITEMS, profitPercent, withGst } from './model'

export default function MarketStall() {
  const [ii, setIi] = useState(0)
  const it = ITEMS[ii]
  const [d, setD] = useState(10)
  const [g, setG] = useState(0)
  const sp = afterDiscount(it.mp, d)
  const pay = withGst(sp, g)
  const pp = profitPercent(it.cp, sp)
  return (
    <LabFrame labId="market-stall" title="Market Stall" subtitle="Cost price, marked price, discount, profit and GST: run your own stall." howTo={<p>Pick an item. You bought it at the cost price and labelled it with the marked price. Choose a discount and see your profit or loss. Add GST to see what the customer pays.</p>}>
      <div className="flex flex-wrap gap-1">
        {ITEMS.map((x, i) => <button key={x.name} type="button" aria-pressed={ii === i} onClick={() => setIi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ii === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Cost price (what you paid)" value={money(it.cp)} />
        <Readout label="Marked price (on the label)" value={money(it.mp)} />
      </div>
      <label className="mt-3 block text-sm">Discount <b>{d}%</b><Slider value={[d]} min={0} max={50} step={5} onValueChange={([v]) => setD(v)} className="mt-1" aria-label="Discount" /></label>
      <label className="mt-2 block text-sm">GST <b>{g}%</b>
        <div className="mt-1 flex gap-1">{[0, 5, 18, 40].map((x) => <button key={x} type="button" aria-pressed={g === x} onClick={() => setG(x)} className={cn('flex-1 rounded-lg border-2 py-1 text-sm', g === x ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x}%</button>)}</div>
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Selling price" value={`${money(it.mp)} − ${d}% = ${money(sp)}`} />
        <Readout label={pp >= 0 ? 'Profit' : 'Loss'} value={`${money(Math.abs(sp - it.cp))} (${Math.round(Math.abs(pp) * 10) / 10}% of CP)`} />
        <Readout label="Customer pays (with GST)" value={`${money(sp)} + ${g}% = ${money(pay)}`} />
      </div>
      <p className={cn('mt-3 rounded-xl px-4 py-2 text-sm', pp >= 0 ? 'bg-success-soft' : 'bg-warn-soft')}>
        {pp >= 0 ? '📈 ' : '📉 '}The discount is a percentage of the <b>marked price</b>; profit or loss % is a percentage of the <b>cost price</b>. {pp < 0 ? `A ${d}% discount is too big: you sell below cost.` : `The largest discount you can give without a loss is ${Math.floor(((it.mp - it.cp) / it.mp) * 100)}%.`} GST goes to the government, not to you. India's GST slabs since 22 September 2025 are 0%, 5%, 18% and 40% (for luxury and sin goods).
      </p>
    </LabFrame>
  )
}
