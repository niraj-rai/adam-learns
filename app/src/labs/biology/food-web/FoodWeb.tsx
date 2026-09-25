import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { collapse, SPECIES, validChain } from './model'

const POS: Record<string, [number, number]> = {
  grass: [90, 250], trees: [250, 250], insects: [60, 180], deer: [150, 180], langur: [260, 180], frog: [40, 110], hornbill: [320, 110],
  snake: [70, 50], eagle: [150, 20], leopard: [240, 70], tiger: [180, 100],
}

export default function FoodWeb() {
  const [tab, setTab] = useState<'web' | 'chain'>('web')
  return (
    <LabFrame labId="food-web" title="Western Ghats Food Web" subtitle="Food chains link together into a web. What happens when one species disappears?" howTo={<p>Tab 1: tap a species to remove it and see who is affected. Tab 2: build your own food chain.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['web', '🕸️ Food web'], ['chain', '🔗 Build a chain']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'web' ? <Web /> : <Chain />}
    </LabFrame>
  )
}

function Web() {
  const [removed, setRemoved] = useState<string[]>([])
  const lost = collapse(removed)
  const toggle = (id: string) => setRemoved((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]))
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <svg viewBox="0 0 360 280" className="w-full rounded-2xl border bg-background" role="img" aria-label="Food web; arrows point from food to eater">
        <defs><marker id="fw" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker></defs>
        {SPECIES.flatMap((s) => s.eats.map((f) => {
          const [x1, y1] = POS[f]
          const [x2, y2] = POS[s.id]
          const dead = removed.includes(f) || removed.includes(s.id) || lost.includes(f) || lost.includes(s.id)
          return <line key={`${f}-${s.id}`} x1={x1} y1={y1} x2={x2 + (x1 - x2) * 0.15} y2={y2 + (y1 - y2) * 0.15} stroke={dead ? '#fecaca' : '#94a3b8'} strokeWidth={1.5} markerEnd="url(#fw)" strokeDasharray={dead ? '3 3' : undefined} />
        }))}
        {SPECIES.map((s) => {
          const [x, y] = POS[s.id]
          const r = removed.includes(s.id)
          const l = lost.includes(s.id)
          return (
            <g key={s.id} onClick={() => toggle(s.id)} className="cursor-pointer">
              <circle cx={x} cy={y} r={17} fill={r ? '#e5e7eb' : l ? '#fee2e2' : 'var(--card)'} stroke={r ? '#6b7280' : l ? '#ef4444' : '#16a34a'} strokeWidth={2} />
              <text x={x} y={y + 6} textAnchor="middle" fontSize={16} opacity={r ? 0.3 : 1}>{s.emoji}</text>
              {(r || l) && <text x={x} y={y + 30} textAnchor="middle" fontSize={8} fill={r ? '#6b7280' : '#ef4444'}>{r ? 'removed' : 'no food!'}</text>}
            </g>
          )
        })}
      </svg>
      <div className="space-y-2">
        <Readout label="Removed" value={removed.length ? removed.map((id) => SPECIES.find((s) => s.id === id)!.name).join(', ') : 'none'} />
        <Readout label="Left with no food" value={lost.length ? lost.map((id) => SPECIES.find((s) => s.id === id)!.name).join(', ') : 'none'} />
        <Button size="sm" variant="ghost" onClick={() => setRemoved([])}>↺ Restore all</Button>
        <p className="rounded-lg bg-chem-soft p-3 text-sm">Arrows point from the food to the eater (the direction energy flows). Animals with several food sources are safer when one disappears. Removing a producer or a key prey can make a whole chain collapse. In reality, other animals could also increase when their predators disappear!</p>
      </div>
    </div>
  )
}

function Chain() {
  const [chain, setChain] = useState<string[]>([])
  const [result, setResult] = useState<null | boolean>(null)
  const check = () => { const ok = validChain(chain); setResult(ok); if (ok) sfx.correct(); else sfx.wrong() }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">{SPECIES.filter((s) => !chain.includes(s.id)).map((s) => <button key={s.id} type="button" onClick={() => { setChain((c) => [...c, s.id]); setResult(null) }} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">{s.emoji} {s.name}</button>)}</div>
      <p className="min-h-10 rounded-xl border bg-background px-4 py-2 text-lg">{chain.length ? chain.map((id) => SPECIES.find((s) => s.id === id)!.emoji).join(' → ') : 'Start with a producer…'}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={check} disabled={chain.length < 2}>Check chain</Button>
        <Button size="sm" variant="ghost" onClick={() => { setChain([]); setResult(null) }}>↺ Clear</Button>
      </div>
      {result !== null && <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', result ? 'bg-success-soft' : 'bg-warn-soft')}>{result ? `✅ A valid food chain with ${chain.length} links! Energy passes from the ${SPECIES.find((s) => s.id === chain[0])!.name.toLowerCase()} (producer) along the chain.` : '❌ Not valid. A chain must start with a producer, and each organism must eat the one before it.'}</p>}
    </div>
  )
}
