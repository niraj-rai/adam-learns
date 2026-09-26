import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { canon, foldFaces, isCubeNet, SOLIDS, type Cell } from './model'

export default function CubeNets() {
  const [tab, setTab] = useState<'nets' | 'euler'>('nets')
  return (
    <LabFrame labId="cube-nets" title="Nets and Solids" subtitle="Which flat patterns fold into a cube? And a formula that works for every solid." howTo={<p>Nets: shade exactly 6 squares and check whether they fold into a cube. Can you find all 11? Euler: count faces, vertices and edges of solids.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['nets', '🧊 Cube nets'], ['euler', '💠 Euler’s formula']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'nets' ? <Nets /> : <Euler />}
    </LabFrame>
  )
}

const G = 5
const FACE_COL = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9', '#a855f7']
const FACE_NAME = ['bottom', 'top', 'back', 'front', 'right', 'left']
const CROSS: Cell[] = [[0, 2], [1, 1], [1, 2], [1, 3], [2, 2], [3, 2]]

function Nets() {
  const [cells, setCells] = useState<Cell[]>(CROSS)
  const [checked, setChecked] = useState(false)
  const [found, setFound] = useState<string[]>([])
  const has = (r: number, c: number) => cells.some((x) => x[0] === r && x[1] === c)
  const toggle = (r: number, c: number) => {
    setChecked(false)
    setCells((cs) => (has(r, c) ? cs.filter((x) => !(x[0] === r && x[1] === c)) : cs.length < 6 ? [...cs, [r, c]] : cs))
  }
  const faces = checked ? foldFaces(cells) : null
  const ok = checked && isCubeNet(cells)
  const counts = new Map<number, number>()
  faces?.forEach((f) => counts.set(f, (counts.get(f) ?? 0) + 1))
  const check = () => {
    setChecked(true)
    if (isCubeNet(cells)) {
      const k = canon(cells)
      if (!found.includes(k)) setFound((f) => [...f, k])
      sfx.correct()
    } else sfx.wrong()
  }
  const connected = (faces?.size ?? 0) === cells.length
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="grid w-64 grid-cols-5 gap-1 rounded-2xl border bg-background p-2" role="grid" aria-label="Net grid">
        {Array.from({ length: G }, (_, r) => Array.from({ length: G }, (_, c) => {
          const on = has(r, c)
          const f = faces?.get(`${r},${c}`)
          const dup = f !== undefined && (counts.get(f) ?? 0) > 1
          return (
            <button key={`${r}-${c}`} type="button" onClick={() => toggle(r, c)} aria-pressed={on} aria-label={`Square row ${r + 1} column ${c + 1}${on ? ', shaded' : ''}`}
              className={cn('aspect-square rounded border text-[9px] font-semibold', on ? 'text-white' : 'bg-muted/40 hover:bg-muted', dup && 'ring-2 ring-destructive')}
              style={on ? { background: f !== undefined ? FACE_COL[f] : '#64748b' } : undefined}>
              {on && f !== undefined ? FACE_NAME[f] : ''}
            </button>
          )
        }))}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button onClick={check} disabled={cells.length !== 6}>Fold it!</Button>
          <Button variant="outline" onClick={() => { setCells([]); setChecked(false) }}>Clear</Button>
        </div>
        <Readout label="Squares shaded" value={`${cells.length} / 6`} />
        <Readout label="Different nets found" value={`${found.length} / 11`} />
        {checked && (
          <p role="status" className={cn('rounded-xl px-3 py-2 text-sm', ok ? 'bg-success-soft' : 'bg-warn-soft')}>
            {ok ? '✅ It folds into a cube! Each colour is a different face.' : !connected ? '❌ The squares must all join edge to edge.' : '❌ Two squares (ringed in red) would fold onto the same face, leaving a face missing.'}
          </p>
        )}
        <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">There are exactly <b>11</b> different cube nets (not counting rotations and reflections). Imagine the cube rolling across the squares: each square becomes the face touching the ground. A net works only if all six faces are different.</p>
      </div>
    </div>
  )
}

function Euler() {
  const [f, setF] = useState(6)
  const [v, setV] = useState(8)
  return (
    <div className="space-y-3">
      <table className="w-full rounded-xl border text-center text-sm">
        <thead><tr className="border-b"><th className="p-2 text-left">Solid</th><th className="p-2">Faces F</th><th className="p-2">Vertices V</th><th className="p-2">Edges E</th><th className="p-2">F + V − E</th></tr></thead>
        <tbody>
          {SOLIDS.map((s) => <tr key={s.name} className="border-b last:border-0"><td className="p-2 text-left">{s.emoji} {s.name}</td><td className="p-2 font-mono">{s.F}</td><td className="p-2 font-mono">{s.V}</td><td className="p-2 font-mono">{s.E}</td><td className="p-2 font-mono font-bold text-success">{s.F + s.V - s.E}</td></tr>)}
        </tbody>
      </table>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Faces <b>{f}</b><Slider value={[f]} min={4} max={20} step={1} onValueChange={([x]) => setF(x)} className="mt-1" aria-label="Faces" /></label>
        <label className="text-sm">Vertices <b>{v}</b><Slider value={[v]} min={4} max={20} step={1} onValueChange={([x]) => setV(x)} className="mt-1" aria-label="Vertices" /></label>
      </div>
      <Readout label="Euler predicts the edges" value={`E = F + V − 2 = ${f} + ${v} − 2 = ${f + v - 2}`} />
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">For every polyhedron without holes, <b>F + V − E = 2</b>. Leonhard Euler wrote about this in 1750. (Not every F and V can actually make a solid, but when one exists, its edges must fit the formula.)</p>
    </div>
  )
}
