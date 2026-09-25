import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { growthRate, HORMONES, MYTHS } from './model'

export default function GrowingUp() {
  const [tab, setTab] = useState<'growth' | 'hormones' | 'myths'>('growth')
  return (
    <LabFrame labId="growing-up" title="Growing Up" subtitle="Adolescence, roughly ages 10–19, is a time of big changes in the body and mind. All of them are normal, and everyone's timing is different." howTo={<p>Tab 1: explore growth-spurt curves. Tab 2: meet the hormones, the body's chemical messengers. Tab 3: myth or fact?</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['growth', '📏 Growth spurt'], ['hormones', '🧪 Hormones'], ['myths', '❓ Myth or fact?']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'growth' && <Growth />}
      {tab === 'hormones' && <Hormones />}
      {tab === 'myths' && <Myths />}
    </LabFrame>
  )
}

function Growth() {
  const [age, setAge] = useState(13)
  const data = useMemo(() => Array.from({ length: 21 }, (_, i) => { const a = 8 + i * 0.5; return { age: a, girls: growthRate(a, 'girls'), boys: growthRate(a, 'boys') } }), [])
  return (
    <div className="space-y-3">
      <div className="h-64 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="age" type="number" domain={[8, 18]} ticks={[8, 10, 12, 14, 16, 18]} tick={{ fontSize: 11 }} label={{ value: 'age (years)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={36} label={{ value: 'cm per year', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x={age} stroke="#f59e0b" />
            <Line dataKey="girls" name="Girls (typical)" stroke="#ec4899" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line dataKey="boys" name="Boys (typical)" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <label className="block text-sm">Age: <b>{age}</b> · typical growth: girls <b>{growthRate(age, 'girls')}</b> cm/year, boys <b>{growthRate(age, 'boys')}</b> cm/year
        <Slider value={[age]} min={8} max={18} step={0.5} onValueChange={([v]) => setAge(v)} className="mt-1.5" aria-label="Age" />
      </label>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">During <b>puberty</b>, bodies go through a <b>growth spurt</b>. On average it starts and peaks earlier in girls than in boys, which is why girls are often taller than boys at around 11–12. These curves are averages: some people start earlier and some later, and both are completely normal. Good food, sleep and exercise support healthy growth.</p>
    </div>
  )
}

function Hormones() {
  return (
    <div className="space-y-2">
      {HORMONES.map((h) => (
        <div key={h.gland} className="grid gap-1 rounded-xl border p-3 text-sm sm:grid-cols-[180px_160px_1fr]">
          <b>{h.gland}</b><span className="text-chem">{h.hormone}</span><span>{h.job}</span>
        </div>
      ))}
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Hormones</b> are chemical messengers made by <b>endocrine glands</b> and carried in the blood. At puberty, signals from the <b>pituitary gland</b> in the brain tell the testes (in boys) and ovaries (in girls) to make more hormones. These cause changes such as growth of body hair, a deeper voice in boys, and the start of periods (menstruation) in girls.</p>
    </div>
  )
}

function Myths() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const choose = (i: number, v: boolean) => {
    if (i in answers) return
    setAnswers((a) => ({ ...a, [i]: v }))
    if (v === MYTHS[i].fact) sfx.correct(); else sfx.wrong()
  }
  return (
    <div className="space-y-2">
      {MYTHS.map((m, i) => (
        <div key={i} className={cn('rounded-xl border p-3 text-sm', i in answers && (answers[i] === m.fact ? 'border-success bg-success-soft' : 'border-destructive bg-destructive/10'))}>
          <p>“{m.statement}”</p>
          {!(i in answers) ? (
            <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => choose(i, true)}>✅ Fact</Button><Button size="sm" variant="outline" onClick={() => choose(i, false)}>❌ Myth</Button></div>
          ) : (
            <p className="mt-1"><b>{m.fact ? 'Fact.' : 'Myth.'}</b> {m.why}</p>
          )}
        </div>
      ))}
    </div>
  )
}
