import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CONVERSIONS, RECIPE, scale } from './model'

export default function RecipeScaler() {
  const [tab, setTab] = useState<'recipe' | 'units'>('recipe')
  return (
    <LabFrame labId="recipe-scaler" title="Recipe Scaler" subtitle="Direct proportion: double the people, double everything. Scale a recipe and convert units." howTo={<p>Recipe: change the number of cups of chai and watch every ingredient scale. Tap an ingredient to see the unitary method. Units: convert between units with a multiplier.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['recipe', '☕ Recipe'], ['units', '📏 Unit conversion']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'recipe' ? <Recipe /> : <Units />}
    </LabFrame>
  )
}

function Recipe() {
  const [n, setN] = useState(6)
  const [sel, setSel] = useState(1)
  const it = RECIPE.items[sel]
  const W = 260
  const H = 170
  const maxY = it.qty * 3
  return (
    <div className="space-y-3">
      <label className="block text-sm">Cups of {RECIPE.name.toLowerCase()}: <b>{n}</b> (the recipe is for {RECIPE.serves})
        <Slider value={[n]} min={1} max={12} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="Servings" />
      </label>
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <table className="w-full rounded-xl border text-sm">
          <thead><tr className="border-b text-left"><th className="p-2">Ingredient</th><th className="p-2">For {RECIPE.serves}</th><th className="p-2">For {n}</th></tr></thead>
          <tbody>
            {RECIPE.items.map((x, i) => (
              <tr key={x.name} onClick={() => setSel(i)} className={cn('cursor-pointer border-b last:border-0 hover:bg-muted/50', sel === i && 'bg-chem-soft')}>
                <td className="p-2">{x.emoji} {x.name}</td>
                <td className="p-2 font-mono">{x.qty} {x.unit}</td>
                <td className="p-2 font-mono font-bold">{scale(x.qty, RECIPE.serves, n)} {x.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`${it.name} is directly proportional to the number of cups`}>
          <line x1={30} y1={H - 25} x2={W - 10} y2={H - 25} stroke="currentColor" />
          <line x1={30} y1={H - 25} x2={30} y2={10} stroke="currentColor" />
          <line x1={30} y1={H - 25} x2={30 + (12 / 12) * (W - 45)} y2={H - 25 - ((it.qty * 3) / maxY) * (H - 40)} stroke="#6366f1" strokeWidth={2.5} />
          <circle cx={30 + (n / 12) * (W - 45)} cy={H - 25 - (scale(it.qty, 4, n) / maxY) * (H - 40)} r={5} fill="#f59e0b" />
          <text x={W - 10} y={H - 8} textAnchor="end" fontSize={10} fill="currentColor">cups →</text>
          <text x={34} y={16} fontSize={10} fill="currentColor">↑ {it.name.toLowerCase()} ({it.unit || 'count'})</text>
        </svg>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label={`Unitary method: ${it.name.toLowerCase()}`} value={`${it.qty} ÷ ${RECIPE.serves} = ${scale(it.qty, RECIPE.serves, 1)} per cup, × ${n} = ${scale(it.qty, RECIPE.serves, n)} ${it.unit}`} />
        <Readout label="Multiplier" value={`× ${n}/${RECIPE.serves} = × ${Math.round((n / RECIPE.serves) * 100) / 100}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Every ingredient is multiplied by the <b>same number</b> ({n}/{RECIPE.serves}). The graph is a straight line through the origin: that's the sign of <b>direct proportion</b>. 0 cups needs 0 of everything!</p>
    </div>
  )
}

function Units() {
  const [ci, setCi] = useState(0)
  const [v, setV] = useState(3)
  const c = CONVERSIONS[ci]
  const out = Math.round(v * c.k * 1000) / 1000
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {CONVERSIONS.map((x, i) => <button key={x.from + x.to} type="button" aria-pressed={ci === i} onClick={() => { setCi(i); setV(x.from === 'km/h' ? 72 : 3) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ci === i ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{x.from} → {x.to}</button>)}
      </div>
      <label className="block text-sm">Amount <b>{v} {c.from}</b><Slider value={[v]} min={0} max={c.from === 'km/h' ? 144 : 20} step={c.from === 'km/h' ? 18 : 0.5} onValueChange={([x]) => setV(x)} className="mt-1" aria-label="Amount" /></label>
      <Readout label="Converted" value={`${v} ${c.from} × ${c.from === 'km/h' ? '5/18' : c.k} = ${out} ${c.to}`} />
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Unit conversion is direct proportion too: every 1 {c.from} is {c.from === 'km/h' ? '5/18' : c.k} {c.to}. {c.from === 'km/h' && '1 km/h = 1000 m ÷ 3600 s = 5/18 m/s, so 72 km/h = 20 m/s.'}</p>
    </div>
  )
}
