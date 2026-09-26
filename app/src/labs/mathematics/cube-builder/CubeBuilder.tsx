import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { primeFactors } from '../_shared/number'
import { cubeCompleter, simplifyCubeRoot, taxicab } from './model'

const ROOT_NUMBERS = [216, 1728, 3375, 2744, 9261, 13824, 500, 250]

export default function CubeBuilder() {
  const [tab, setTab] = useState<'build' | 'roots' | 'taxi'>('build')
  return (
    <LabFrame labId="cube-builder" title="Cube Builder" subtitle="Stack unit cubes into bigger cubes, find cube roots, and meet the famous number 1729." howTo={<p>Build: change the edge length and count the small cubes. Cube roots: group prime factors in threes. 1729: search for numbers that are a sum of two cubes in two ways.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['build', '🧊 Build'], ['roots', '🔺 Cube roots'], ['taxi', '🚕 1729']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'build' ? <Build /> : tab === 'roots' ? <Roots /> : <Taxi />}
    </LabFrame>
  )
}

function Iso({ n }: { n: number }) {
  const W = 260
  const s = 120 / n
  const cy = 10 + n * s
  const P = (x: number, y: number, z: number) => `${W / 2 + (x - y) * s * 0.866},${cy + (x + y) * s * 0.5 - z * s}`
  const tiles: { pts: string; fill: string }[] = []
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      tiles.push({ pts: [P(i, j, n), P(i + 1, j, n), P(i + 1, j + 1, n), P(i, j + 1, n)].join(' '), fill: '#fcd34d' })
      tiles.push({ pts: [P(n, i, j), P(n, i + 1, j), P(n, i + 1, j + 1), P(n, i, j + 1)].join(' '), fill: '#f59e0b' })
      tiles.push({ pts: [P(i, n, j), P(i + 1, n, j), P(i + 1, n, j + 1), P(i, n, j + 1)].join(' '), fill: '#d97706' })
    }
  return (
    <svg viewBox={`0 0 ${W} 260`} className="w-full max-w-[260px] rounded-2xl border bg-background" role="img" aria-label={`A cube made of ${n} × ${n} × ${n} = ${n ** 3} small cubes`}>
      {tiles.map((t, i) => <polygon key={i} points={t.pts} fill={t.fill} stroke="#78350f" strokeWidth={0.8} strokeLinejoin="round" />)}
    </svg>
  )
}

function Build() {
  const [n, setN] = useState(3)
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <Iso n={n} />
      <div className="space-y-3">
        <label className="block text-sm">Edge length <b>{n}</b>
          <Slider value={[n]} min={1} max={8} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Edge length" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Readout label="Small cubes" value={`${n} × ${n} × ${n} = ${n ** 3}`} />
          <Readout label="Visible from here" value={`${3 * n * n - 3 * n + 1}`} />
        </div>
        <p className="font-mono text-sm">Cube numbers: {Array.from({ length: 10 }, (_, k) => <span key={k} className={cn(k + 1 === n && 'font-bold text-chem')}>{(k + 1) ** 3}{k < 9 ? ', ' : ''}</span>)}</p>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A cube number is n × n × n = n³ (“n cubed”): the number of small cubes in a bigger cube. Most cubes are hidden inside! Only {3 * n * n - 3 * n + 1} of the {n ** 3} can be seen from this corner.</p>
      </div>
    </div>
  )
}

function Roots() {
  const [n, setN] = useState(1728)
  const ps = primeFactors(n)
  const { outside, inside } = simplifyCubeRoot(n)
  const m = cubeCompleter(n)
  const groups: number[][] = []
  for (let i = 0; i < ps.length; ) {
    if (ps[i] === ps[i + 1] && ps[i] === ps[i + 2]) { groups.push(ps.slice(i, i + 3)); i += 3 } else { groups.push([ps[i]]); i += 1 }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {ROOT_NUMBERS.map((v) => (
          <button key={v} type="button" aria-pressed={n === v} onClick={() => setN(v)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', n === v ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{v}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-4 font-mono text-lg">
        <span>{n} =</span>
        {groups.map((g, i) => (
          <span key={i} className={cn('rounded-lg border-2 px-2 py-0.5', g.length === 3 ? 'border-success bg-success-soft' : 'border-warn bg-warn-soft')}>{g.join(' × ')}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="One from each triple" value={groups.filter((g) => g.length === 3).map((g) => g[0]).join(' × ') || '—'} />
        <Readout label={`∛${n}`} value={inside === 1 ? `${outside}` : `not a whole number (≈ ${Math.cbrt(n).toFixed(3)})`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {inside === 1
          ? <>Every prime appears in a group of three, so {n} is a <b>perfect cube</b>: ∛{n} = {outside}, and {outside}³ = {n}.</>
          : <>Some primes aren't in a full triple, so {n} is <b>not</b> a perfect cube. Multiply by <b>{m}</b> to complete the triples: {n} × {m} = {n * m} = {Math.round(Math.cbrt(n * m))}³.</>}
      </p>
    </div>
  )
}

function Taxi() {
  const [found, setFound] = useState<ReturnType<typeof taxicab> | null>(null)
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-muted/50 p-4 text-[15px]">
        🚕 In 1918, the mathematician G. H. Hardy visited <b>Srinivasa Ramanujan</b> in hospital and said his taxi number, 1729, seemed rather dull. Ramanujan replied at once: no, it is very interesting! It is the <b>smallest number that is the sum of two cubes in two different ways</b>.
      </div>
      <Button onClick={() => setFound(taxicab(20000))}>Search all sums of two cubes up to 20,000</Button>
      {found && (
        <table className="w-full rounded-2xl border bg-background text-sm">
          <thead><tr className="border-b text-left"><th className="p-2">Number</th><th className="p-2">Two ways</th></tr></thead>
          <tbody className="font-mono">
            {found.map(([s, ways]) => (
              <tr key={s} className={cn('border-b last:border-0', s === 1729 && 'bg-success-soft font-bold')}>
                <td className="p-2">{s.toLocaleString('en-IN')}</td>
                <td className="p-2">{ways.map(([a, b]) => `${a}³ + ${b}³`).join('  =  ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
