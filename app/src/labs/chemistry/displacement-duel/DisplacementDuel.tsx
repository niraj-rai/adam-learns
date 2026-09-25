import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

/** Ordered most → least reactive. A metal displaces any metal BELOW it from its salt solution. */
const METALS = [
  { id: 'Mg', name: 'Magnesium', colour: '#d4d4d8', coat: '#e5e7eb' },
  { id: 'Zn', name: 'Zinc', colour: '#94a3b8', coat: '#64748b' },
  { id: 'Fe', name: 'Iron', colour: '#6b7280', coat: '#374151' },
  { id: 'Cu', name: 'Copper', colour: '#c2410c', coat: '#b45309' },
  { id: 'Ag', name: 'Silver', colour: '#e5e7eb', coat: '#d1d5db' },
]
const SALTS = [
  { metal: 'Mg', name: 'Magnesium sulfate', colour: '#f8fafc' },
  { metal: 'Zn', name: 'Zinc sulfate', colour: '#f8fafc' },
  { metal: 'Fe', name: 'Iron(II) sulfate', colour: '#bbf7d0' },
  { metal: 'Cu', name: 'Copper sulfate', colour: '#7dd3fc' },
  { metal: 'Ag', name: 'Silver nitrate', colour: '#f8fafc' },
]
const rank = (id: string) => METALS.findIndex((m) => m.id === id)

type Cell = { prediction?: boolean; revealed?: boolean }

export default function DisplacementDuel() {
  const [cells, setCells] = useState<Record<string, Cell>>({})
  const [active, setActive] = useState<string | null>(null)
  const [orderGuess, setOrderGuess] = useState<string[]>([])

  const key = (m: string, s: string) => `${m}|${s}`
  const reacts = (m: string, s: string) => rank(m) < rank(s)

  const predict = (m: string, s: string, p: boolean) => {
    setCells((c) => ({ ...c, [key(m, s)]: { ...c[key(m, s)], prediction: p } }))
  }
  const reveal = (m: string, s: string) => {
    const k = key(m, s)
    setCells((c) => ({ ...c, [k]: { ...c[k], revealed: true } }))
    setActive(k)
    const p = cells[k]?.prediction
    if (p !== undefined) (p === reacts(m, s) ? sfx.correct : sfx.wrong)()
  }

  const valid = METALS.flatMap((m) => SALTS.filter((s) => s.metal !== m.id).map((s) => key(m.id, s.metal)))
  const revealedCount = valid.filter((k) => cells[k]?.revealed).length
  const correctPredictions = valid.filter((k) => {
    const [m, s] = k.split('|')
    return cells[k]?.revealed && cells[k]?.prediction === reacts(m, s)
  }).length

  const act = active ? active.split('|') : null
  const actMetal = act ? METALS.find((m) => m.id === act[0])! : null
  const actSalt = act ? SALTS.find((s) => s.metal === act[1])! : null
  const actReacts = act ? reacts(act[0], act[1]) : false

  return (
    <LabFrame
      labId="displacement-duel"
      title="Displacement Duel"
      subtitle="Dip each metal into each salt solution. A more reactive metal pushes a less reactive one out!"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>For each metal + solution, first predict ✅ (reaction) or ❌ (no reaction), then tap 🔍 to see what happens.</li>
          <li>Use the pattern to work out the <b>reactivity series</b> order at the bottom.</li>
        </ul>
      }
    >
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="text-right">Metal ↓ / Solution →</th>
              {SALTS.map((s) => (
                <th key={s.metal} className="w-24 text-center font-semibold">
                  <span className="mx-auto mb-1 block h-3 w-8 rounded border border-black/20" style={{ background: s.colour }} />
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METALS.map((m) => (
              <tr key={m.id}>
                <th className="pr-2 text-right font-semibold whitespace-nowrap">{m.name}</th>
                {SALTS.map((s) => {
                  if (s.metal === m.id) return <td key={s.metal} className="rounded-lg bg-muted text-center text-muted-foreground">same</td>
                  const k = key(m.id, s.metal)
                  const c = cells[k] ?? {}
                  const r = reacts(m.id, s.metal)
                  return (
                    <td key={s.metal} className={cn('rounded-lg border p-1 text-center', c.revealed && (r ? 'bg-success-soft' : 'bg-muted/60'), c.revealed && c.prediction !== undefined && c.prediction !== r && 'ring-2 ring-destructive/50')}>
                      {c.revealed ? (
                        <button type="button" onClick={() => setActive(k)} className="w-full font-semibold">{r ? '✅ reacts' : '❌ none'}</button>
                      ) : (
                        <div className="flex items-center justify-center gap-0.5">
                          <button type="button" aria-label={`Predict ${m.name} reacts with ${s.name}`} onClick={() => predict(m.id, s.metal, true)} className={cn('rounded px-1', c.prediction === true && 'bg-primary/15')}>✅</button>
                          <button type="button" aria-label={`Predict no reaction`} onClick={() => predict(m.id, s.metal, false)} className={cn('rounded px-1', c.prediction === false && 'bg-primary/15')}>❌</button>
                          <button type="button" aria-label={`Test ${m.name} in ${s.name}`} onClick={() => reveal(m.id, s.metal)} className="rounded px-1 hover:bg-muted">🔍</button>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">Tested {revealedCount} / {valid.length} · Correct predictions: {correctPredictions}</p>

      {actMetal && actSalt && (
        <div className="mt-3 grid gap-3 rounded-2xl border bg-background p-4 sm:grid-cols-[140px_1fr]">
          <svg viewBox="0 0 100 120" className="mx-auto w-28" aria-hidden>
            <motion.rect key={active} x={15} y={40} width={70} height={70} rx={6} initial={{ fill: actSalt.colour }} animate={{ fill: actReacts && actSalt.metal === 'Cu' ? (actMetal.id === 'Fe' ? '#bbf7d0' : '#f1f5f9') : actSalt.colour }} transition={{ duration: 2 }} />
            <rect x={44} y={10} width={12} height={90} rx={2} fill={actMetal.colour} stroke="#64748b" />
            {actReacts && <motion.rect x={44} y={40} width={12} height={60} rx={2} fill={METALS[rank(actSalt.metal)].coat} initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 2 }} />}
            <path d="M13 30 V108 a4 4 0 0 0 4 4 H83 a4 4 0 0 0 4 -4 V30" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={2} />
          </svg>
          <div className="text-sm" role="status">
            {actReacts ? (
              <>
                <p className="font-semibold">✅ Reaction! {actMetal.name} is MORE reactive than {METALS[rank(actSalt.metal)].name.toLowerCase()}, so it pushes it out of the solution.</p>
                <p className="mt-1">A coating of {METALS[rank(actSalt.metal)].name.toLowerCase()} forms on the {actMetal.name.toLowerCase()}{actSalt.metal === 'Cu' ? ' and the blue colour fades' : ''}.</p>
                <p className="mt-1 text-muted-foreground">{actMetal.name.toLowerCase()} + {actSalt.name.toLowerCase()} → {actMetal.name.toLowerCase()} {actSalt.name.split(' ').slice(-1)[0]} + {METALS[rank(actSalt.metal)].name.toLowerCase()}</p>
              </>
            ) : (
              <p className="font-semibold">❌ No reaction. {actMetal.name} is LESS reactive than {METALS[rank(actSalt.metal)].name.toLowerCase()}, so it can't push it out.</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border p-3">
        <p className="text-sm font-semibold">Build the reactivity series: tap the metals from MOST to LEAST reactive.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {METALS.filter((m) => !orderGuess.includes(m.id)).map((m) => (
            <Button key={m.id} size="sm" variant="outline" onClick={() => setOrderGuess((o) => [...o, m.id])}>{m.name}</Button>
          ))}
          {orderGuess.length > 0 && <Button size="sm" variant="ghost" onClick={() => setOrderGuess([])}>Clear</Button>}
        </div>
        {orderGuess.length > 0 && <p className="mt-2 text-sm">Your order: <b>{orderGuess.map((id) => METALS.find((m) => m.id === id)!.name).join(' > ')}</b></p>}
        {orderGuess.length === METALS.length && (
          <p className={cn('mt-2 rounded-lg px-3 py-2 text-sm', orderGuess.join() === METALS.map((m) => m.id).join() ? 'bg-success-soft' : 'bg-warn-soft')}>
            {orderGuess.join() === METALS.map((m) => m.id).join() ? '🎉 Correct! Magnesium > zinc > iron > copper > silver. The more solutions a metal reacts with, the more reactive it is.' : 'Not quite. Count how many solutions each metal reacted with: the most reactive metal reacts with the most.'}
          </p>
        )}
      </div>
    </LabFrame>
  )
}
