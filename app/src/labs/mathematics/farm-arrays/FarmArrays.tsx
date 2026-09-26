import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SliderRow } from '../_shared/SliderRow'

export default function FarmArrays() {
  const [mode, setMode] = useState<'multiply' | 'share'>('multiply')
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(6)
  const [total, setTotal] = useState(26)
  const [baskets, setBaskets] = useState(4)
  const each = Math.floor(total / baskets)
  const left = total % baskets
  return (
    <LabFrame labId="farm-arrays" title="Coconut Farm" subtitle="Rows of trees show multiplication. Sharing coconuts into baskets shows division, sometimes with some left over." howTo={<p>In <b>Multiply</b> mode, change the rows and trees in each row. In <b>Share</b> mode, share coconuts equally into baskets.</p>}>
      <div className="mb-3 flex gap-2">{(['multiply', 'share'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`rounded-lg border-2 px-3 py-1 text-sm ${mode === m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{m === 'multiply' ? '🌴 Multiply' : '🧺 Share'}</button>)}</div>
      {mode === 'multiply' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border p-2" aria-label={`${rows} rows of ${cols} trees`}>
            {Array.from({ length: rows }, (_, r) => <div key={r} className="flex justify-center gap-0.5 text-lg leading-6 sm:text-xl">{Array.from({ length: cols }, (_, c) => <span key={c}>🌴</span>)}</div>)}
          </div>
          <div className="space-y-3">
            <SliderRow label="Rows" value={rows} min={1} max={9} onChange={setRows} />
            <SliderRow label="Trees in each row" value={cols} min={1} max={10} onChange={setCols} />
            <Readout label="Total trees" value={`${rows} × ${cols} = ${rows * cols}`} />
            <p className="text-sm text-muted-foreground">Turn the farm on its side: {cols} × {rows} is also {rows * cols}. The order doesn’t matter! If each tree gives 30 coconuts, the farm gives {rows * cols} × 30 = {rows * cols * 30}.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="space-y-2 rounded-2xl border p-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{Array.from({ length: baskets }, (_, b) => <div key={b} className="rounded-xl bg-muted/60 p-1 text-center text-sm">🧺<div className="break-all">{'🥥'.repeat(each)}</div></div>)}</div>
            {left > 0 && <p className="text-center text-sm">Left over: {'🥥'.repeat(left)}</p>}
          </div>
          <div className="space-y-3">
            <SliderRow label="Coconuts" value={total} min={1} max={40} onChange={setTotal} />
            <SliderRow label="Baskets" value={baskets} min={1} max={6} onChange={setBaskets} />
            <Readout label="Division" value={`${total} ÷ ${baskets} = ${each}${left ? ` remainder ${left}` : ''}`} />
            <p className="text-sm text-muted-foreground">Check: {baskets} × {each}{left ? ` + ${left}` : ''} = {total}. Multiplication and division undo each other.</p>
          </div>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Kerala means “land of coconut trees” in Malayalam. Farmers plant trees in neat rows so they can count them quickly by multiplying instead of counting one by one.</p>
    </LabFrame>
  )
}
