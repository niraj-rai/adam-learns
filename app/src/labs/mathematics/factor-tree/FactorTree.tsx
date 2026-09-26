import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { factors, isPrime, powerForm, primePowers } from '../_shared/number'
import { factorPairs, sharedFactors } from './model'

type Node = { n: number; kids?: [Node, Node] }
const START = [36, 60, 72, 84, 96, 120, 180, 210, 360]

export default function FactorTree() {
  const [tab, setTab] = useState<'tree' | 'hcf'>('tree')
  return (
    <LabFrame labId="factor-tree" title="Factor Tree" subtitle="Split any number into primes, the building blocks of every whole number." howTo={<p>Factor tree: tap a number that isn't prime and choose how to split it. Keep going until every branch ends in a prime. HCF & LCM: pick two numbers and see which prime factors they share.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['tree', '🌳 Factor tree'], ['hcf', '🔗 HCF & LCM']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'tree' ? <Tree /> : <Hcf />}
    </LabFrame>
  )
}

const split = (node: Node, path: number[], pair: [number, number]): Node =>
  path.length === 0
    ? { ...node, kids: [{ n: pair[0] }, { n: pair[1] }] }
    : { ...node, kids: node.kids!.map((k, i) => (i === path[0] ? split(k, path.slice(1), pair) : k)) as [Node, Node] }
const leaves = (node: Node): number[] => (node.kids ? [...leaves(node.kids[0]), ...leaves(node.kids[1])] : [node.n])

function Tree() {
  const [n, setN] = useState(360)
  const [root, setRoot] = useState<Node>({ n: 360 })
  const [open, setOpen] = useState<string | null>(null)
  const ls = leaves(root)
  const done = ls.every(isPrime)
  const restart = (v: number) => { setN(v); setRoot({ n: v }); setOpen(null) }
  const pick = (path: number[], pair: [number, number]) => {
    const next = split(root, path, pair)
    setRoot(next)
    setOpen(null)
    if (leaves(next).every(isPrime)) sfx.correct()
    else sfx.click()
  }
  const count = primePowers(n).reduce((c, [, k]) => c * (k + 1), 1)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {START.map((v) => (
          <button key={v} type="button" aria-pressed={n === v} onClick={() => restart(v)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm font-semibold', n === v ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{v}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-background p-4">
        <TreeView node={root} path={[]} open={open} setOpen={setOpen} pick={pick} />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Readout label="Leaves so far" value={ls.join(' × ')} />
        <Readout label="Prime factorisation" value={done ? `${n} = ${powerForm(n)}` : 'Keep splitting…'} />
        <Readout label="Number of factors" value={done ? `${count}` : '?'} />
      </div>
      {done && (
        <p className="rounded-xl bg-success-soft px-4 py-2 text-sm">
          🎉 Every branch ends in a prime. Try a different first split: you always get the <b>same primes</b>. That's the <b>Fundamental Theorem of Arithmetic</b>. The powers also tell you how many factors {n} has: {primePowers(n).map(([, k]) => `(${k} + 1)`).join(' × ')} = {count}.
        </p>
      )}
    </div>
  )
}

function TreeView({ node, path, open, setOpen, pick }: { node: Node; path: number[]; open: string | null; setOpen: (s: string | null) => void; pick: (p: number[], pair: [number, number]) => void }) {
  const key = path.join('-') || 'root'
  const prime = isPrime(node.n)
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={prime || Boolean(node.kids)}
        onClick={() => setOpen(open === key ? null : key)}
        className={cn('grid size-12 place-items-center rounded-full border-2 font-mono font-bold', prime ? 'border-success bg-success-soft text-success' : node.kids ? 'border-muted-foreground/30 bg-muted' : 'border-chem bg-chem-soft hover:brightness-95', open === key && 'ring-2 ring-primary')}
        aria-label={prime ? `${node.n}, prime` : `${node.n}: choose a split`}
      >
        {node.n}
      </button>
      {open === key && (
        <div className="mt-1 flex flex-wrap justify-center gap-1">
          {factorPairs(node.n).map(([a, b]) => (
            <button key={a} type="button" onClick={() => pick(path, [a, b])} className="rounded-md border bg-card px-2 py-0.5 text-xs hover:bg-muted">{a} × {b}</button>
          ))}
        </div>
      )}
      {node.kids && (
        <>
          <div className="text-muted-foreground" aria-hidden>╱ ╲</div>
          <div className="flex gap-3">
            {node.kids.map((k, i) => <TreeView key={i} node={k} path={[...path, i]} open={open} setOpen={setOpen} pick={pick} />)}
          </div>
        </>
      )}
    </div>
  )
}

function Hcf() {
  const [a, setA] = useState(84)
  const [b, setB] = useState(90)
  const s = sharedFactors(a, b)
  const chips = (xs: number[]) => (xs.length ? xs.join(' × ') : '—')
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">First number <b>{a}</b><Slider value={[a]} min={2} max={200} step={1} onValueChange={([v]) => setA(v)} className="mt-1.5" aria-label="First number" /></label>
        <label className="text-sm">Second number <b>{b}</b><Slider value={[b]} min={2} max={200} step={1} onValueChange={([v]) => setB(v)} className="mt-1.5" aria-label="Second number" /></label>
      </div>
      <svg viewBox="0 0 420 200" className="w-full max-w-lg rounded-2xl border bg-background" role="img" aria-label={`Prime factors: only ${a}: ${chips(s.onlyA)}; shared: ${chips(s.both)}; only ${b}: ${chips(s.onlyB)}`}>
        <circle cx={160} cy={100} r={85} fill="#38bdf8" fillOpacity={0.25} stroke="#0284c7" />
        <circle cx={260} cy={100} r={85} fill="#f472b6" fillOpacity={0.25} stroke="#db2777" />
        <text x={110} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0284c7">{a}</text>
        <text x={310} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill="#db2777">{b}</text>
        {[[s.onlyA, 120], [s.both, 210], [s.onlyB, 300]].map(([xs, x]) => (
          <text key={x as number} x={x as number} y={106} textAnchor="middle" fontSize={15} fontFamily="monospace" fill="currentColor">{(xs as number[]).join(' ') || '·'}</text>
        ))}
      </svg>
      <div className="grid gap-2 sm:grid-cols-3">
        <Readout label="HCF (middle)" value={`${chips(s.both)} = ${s.hcf}`} />
        <Readout label="LCM (everything)" value={`${s.lcm}`} />
        <Readout label="Check: HCF × LCM" value={`${s.hcf} × ${s.lcm} = ${s.hcf * s.lcm} = ${a} × ${b}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The <b>HCF</b> uses only the primes both numbers share (the overlap). The <b>LCM</b> uses every prime, counting shared ones once. {s.hcf === 1 ? <>These two numbers share no primes: they are <b>co-prime</b>.</> : <>Factors of {a}: {factors(a).length}, factors of {b}: {factors(b).length}.</>}</p>
      <Button variant="outline" onClick={() => { setA(12); setB(18) }}>Try 12 and 18</Button>
    </div>
  )
}
