import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ANIMALS, CYCLES, inOrder } from './model'

export default function LifeCycles() {
  const [tab, setTab] = useState<'cycles' | 'eggs'>('cycles')
  return (
    <LabFrame labId="life-cycles" title="Life Cycles" subtitle="Some animals hatch from eggs, some are born alive, and some completely change their body shape as they grow." howTo={<p>Tab 1: put the stages of each life cycle in order. Tab 2: sort animals into those that lay eggs and those that give birth to young.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['cycles', '🔁 Order the stages'], ['eggs', '🥚 Eggs or young?']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'cycles' ? <Cycles /> : <Eggs />}
    </LabFrame>
  )
}

function Cycles() {
  const [cid, setCid] = useState('frog')
  const [order, setOrder] = useState<string[]>([])
  const [result, setResult] = useState<null | boolean>(null)
  const [done, setDone] = useState<string[]>([])
  const c = CYCLES.find((x) => x.id === cid)!
  const pool = useMemo(() => shuffle(c.stages), [cid]) // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (s: string) => { if (!order.includes(s)) { setOrder((o) => [...o, s]); setResult(null) } }
  const check = () => {
    const ok = inOrder(cid, order)
    setResult(ok)
    if (ok) { sfx.correct(); setDone((d) => (d.includes(cid) ? d : [...d, cid])) } else sfx.wrong()
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">{CYCLES.map((x) => <button key={x.id} type="button" onClick={() => { setCid(x.id); setOrder([]); setResult(null) }} className={cn('rounded-full border px-3 py-1 text-sm', x.id === cid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{done.includes(x.id) ? '✅' : x.emoji} {x.name}</button>)}</div>
      <div className="flex flex-wrap gap-1.5">{pool.filter((s) => !order.includes(s)).map((s) => <button key={s} type="button" onClick={() => pick(s)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">{s}</button>)}</div>
      <ol className="space-y-1">{order.map((s, i) => <li key={s} className="rounded-md bg-muted/50 px-3 py-1 text-sm">{i + 1}. {s}</li>)}</ol>
      <div className="flex gap-2">
        <Button size="sm" onClick={check} disabled={order.length !== c.stages.length}>Check</Button>
        <Button size="sm" variant="ghost" onClick={() => { setOrder([]); setResult(null) }}>↺ Reset</Button>
      </div>
      {result !== null && (
        <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', result ? 'bg-success-soft' : 'bg-warn-soft')}>
          {result ? `✅ Correct! Fertilisation: ${c.fertilisation}. ${c.birth === 'oviparous' ? 'Lays eggs (oviparous).' : c.birth === 'viviparous' ? 'Gives birth to young (viviparous).' : 'Reproduces asexually by budding.'} ${c.metamorphosis ? 'Its body changes completely as it grows: metamorphosis.' : ''}` : '❌ Not quite. Think about what comes first and what the young one looks like.'}
        </p>
      )}
    </div>
  )
}

function Eggs() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const correct = ANIMALS.filter((a) => answers[a.name] === a.oviparous).length
  return (
    <div className="space-y-2">
      {ANIMALS.map((a) => {
        const ans = answers[a.name]
        return (
          <div key={a.name} className={cn('flex items-center justify-between rounded-xl border px-3 py-2 text-sm', ans !== undefined && (ans === a.oviparous ? 'border-success bg-success-soft' : 'border-destructive bg-destructive/10'))}>
            <span>{a.name}</span>
            <div className="flex gap-1">
              <Button size="sm" variant={ans === true ? 'default' : 'outline'} onClick={() => setAnswers((x) => ({ ...x, [a.name]: true }))}>🥚 Lays eggs</Button>
              <Button size="sm" variant={ans === false ? 'default' : 'outline'} onClick={() => setAnswers((x) => ({ ...x, [a.name]: false }))}>🍼 Gives birth</Button>
            </div>
          </div>
        )
      })}
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">{correct} / {ANIMALS.length} correct. Animals that lay eggs are <b>oviparous</b>; animals that give birth to young are <b>viviparous</b>. In sexual reproduction, a male cell (sperm) fuses with a female cell (egg) to form a <b>zygote</b>, which grows into an embryo. In frogs and fish this happens outside the body (external fertilisation); in birds and mammals it happens inside (internal fertilisation).</p>
    </div>
  )
}
