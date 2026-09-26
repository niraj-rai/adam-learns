import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { compoundAmount, depreciate, money, simpleAmount } from './model'

const PER = [{ k: 1, name: 'Yearly' }, { k: 2, name: 'Half-yearly' }, { k: 4, name: 'Quarterly' }]

export default function InterestGrowth() {
  const [tab, setTab] = useState<'grow' | 'shrink'>('grow')
  return (
    <LabFrame labId="interest-growth" title="Interest and Growth" subtitle="Simple interest grows in a straight line; compound interest grows faster and faster." howTo={<p>Growth: set the amount, rate and time, and compare simple and compound interest. Depreciation: watch the value of a scooter fall by a percentage each year.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['grow', '🌱 Interest'], ['shrink', '🛵 Depreciation']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'grow' ? <Grow /> : <Shrink />}
    </LabFrame>
  )
}

function Grow() {
  const [p, setP] = useState(10000)
  const [r, setR] = useState(10)
  const [t, setT] = useState(10)
  const [per, setPer] = useState(1)
  const data = Array.from({ length: t + 1 }, (_, y) => ({ year: y, simple: Math.round(simpleAmount(p, r, y)), compound: Math.round(compoundAmount(p, r, y, per)) }))
  const si = simpleAmount(p, r, t)
  const ci = compoundAmount(p, r, t, per)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Principal <b>{money(p)}</b><Slider value={[p]} min={1000} max={50000} step={1000} onValueChange={([v]) => setP(v)} className="mt-1" aria-label="Principal" /></label>
        <label className="text-sm">Rate <b>{r}% per year</b><Slider value={[r]} min={1} max={20} step={1} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="Rate" /></label>
        <label className="text-sm">Time <b>{t} years</b><Slider value={[t]} min={1} max={25} step={1} onValueChange={([v]) => setT(v)} className="mt-1" aria-label="Years" /></label>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-sm">Compounded:
        {PER.map((x) => <button key={x.k} type="button" aria-pressed={per === x.k} onClick={() => setPer(x.k)} className={cn('rounded-lg border-2 px-2.5 py-0.5', per === x.k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}
      </div>
      <div className="h-64 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'years', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => money(Number(v))} />
            <Legend />
            <Line dataKey="simple" name="Simple interest" stroke="#0ea5e9" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line dataKey="compound" name="Compound interest" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Readout label="Simple: P(1 + RT/100)" value={`${money(si)} (interest ${money(si - p)})`} />
        <Readout label={`Compound: P(1 + R/${100 * per})^${t * per}`} value={`${money(ci)} (interest ${money(ci - p)})`} />
        <Readout label="Extra from compounding" value={money(ci - si)} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Simple interest</b> is paid only on the original amount, so it grows by the same {money((p * r) / 100)} every year: a straight line. <b>Compound interest</b> also earns interest on earlier interest, so each year's growth is bigger than the last. {per > 1 && `Compounding ${PER.find((x) => x.k === per)!.name.toLowerCase()} adds interest more often, so the total is a little higher.`}</p>
    </div>
  )
}

function Shrink() {
  const [p, setP] = useState(90000)
  const [r, setR] = useState(15)
  const data = Array.from({ length: 11 }, (_, y) => ({ year: y, value: Math.round(depreciate(p, r, y)) }))
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">New scooter price <b>{money(p)}</b><Slider value={[p]} min={40000} max={150000} step={5000} onValueChange={([v]) => setP(v)} className="mt-1" aria-label="Price" /></label>
        <label className="text-sm">Depreciation <b>{r}% per year</b><Slider value={[r]} min={5} max={30} step={1} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="Depreciation rate" /></label>
      </div>
      <div className="h-56 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'years', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => money(Number(v))} />
            <Line dataKey="value" name="Value" stroke="#ef4444" strokeWidth={2.5} dot isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Readout label="After 1 year" value={money(depreciate(p, r, 1))} />
        <Readout label="After 5 years" value={money(depreciate(p, r, 5))} />
        <Readout label="After 10 years" value={money(depreciate(p, r, 10))} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Each year the scooter loses {r}% of what it was worth <i>at the start of that year</i>, so the value is multiplied by {(1 - r / 100).toFixed(2)} each year: P(1 − R/100)ᵗ. It's compound interest in reverse, so it falls quickly at first and then more slowly.</p>
    </div>
  )
}
