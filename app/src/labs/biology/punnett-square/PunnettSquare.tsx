import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { cross } from './model'

const TRAITS = [
  { id: 'height', gene: 'T', name: 'Plant height', dom: 'Tall', rec: 'Short', emojiD: '🌿', emojiR: '🌱' },
  { id: 'seed', gene: 'R', name: 'Seed shape', dom: 'Round', rec: 'Wrinkled', emojiD: '🟢', emojiR: '🫛' },
  { id: 'colour', gene: 'Y', name: 'Seed colour', dom: 'Yellow', rec: 'Green', emojiD: '🟡', emojiR: '🟢' },
]
const GENOS = (G: string) => [G + G, G + G.toLowerCase(), G.toLowerCase() + G.toLowerCase()]

export default function PunnettSquare() {
  const [mode, setMode] = useState<'mendel' | 'sex'>('mendel')
  const [ti, setTi] = useState(0)
  const t = TRAITS[ti]
  const [p1, setP1] = useState(1)
  const [p2, setP2] = useState(1)
  const [sim, setSim] = useState<{ d: number; r: number } | null>(null)
  const g1 = mode === 'sex' ? 'XX' : GENOS(t.gene)[p1]
  const g2 = mode === 'sex' ? 'XY' : GENOS(t.gene)[p2]
  const r = cross(g1, g2)
  const show = (g: string) => mode === 'sex' ? (g.includes('Y') ? '👦 XY boy' : '👧 XX girl') : g[0] === g[0].toUpperCase() ? `${t.emojiD} ${g}` : `${t.emojiR} ${g}`
  const simulate = () => {
    let d = 0
    for (let i = 0; i < 1000; i++) {
      const a = g1[Math.random() < 0.5 ? 0 : 1]
      const b = g2[Math.random() < 0.5 ? 0 : 1]
      if (mode === 'sex' ? (a === 'Y' || b === 'Y') : (a === a.toUpperCase() || b === b.toUpperCase())) d++
    }
    setSim({ d, r: 1000 - d })
  }
  const Pick = ({ v, set, label }: { v: number; set: (n: number) => void; label: string }) => (
    <div><p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p><div className="mt-1 flex gap-1">{GENOS(t.gene).map((g, k) => <button key={g} type="button" aria-pressed={v === k} onClick={() => { set(k); setSim(null) }} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', v === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{g}</button>)}</div></div>
  )
  return (
    <LabFrame labId="punnett-square" title="Mendel's Peas" subtitle="Each parent passes on one copy of each gene. A Punnett square predicts the offspring." howTo={<p>Choose a trait and each parent's genotype (TT, Tt or tt), then read the Punnett square. Grow 1000 plants to see the ratio appear. Try sex determination too.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">{([['mendel', "🌿 Mendel's peas"], ['sex', '👧👦 Boy or girl?']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => { setMode(k); setSim(null) }} className={cn('rounded-md px-3 py-1', mode === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}</div>
      {mode === 'mendel' && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1">{TRAITS.map((x, k) => <button key={x.id} type="button" aria-pressed={ti === k} onClick={() => { setTi(k); setSim(null) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ti === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}: {x.dom} / {x.rec}</button>)}</div>
          <div className="grid gap-3 sm:grid-cols-2"><Pick v={p1} set={setP1} label="Parent 1" /><Pick v={p2} set={setP2} label="Parent 2" /></div>
        </div>
      )}
      <div className="mt-3 grid items-start gap-4 md:grid-cols-[auto_1fr]">
        <table className="text-center">
          <tbody>
            <tr><td /><td className="p-2 font-mono font-bold text-chem">{g2[0]}</td><td className="p-2 font-mono font-bold text-chem">{g2[1]}</td></tr>
            {r.grid.map((row, i) => <tr key={i}><td className="p-2 font-mono font-bold text-chem">{g1[i]}</td>{row.map((g, j) => <td key={j} className="min-w-24 border-2 p-3 text-sm">{show(g)}</td>)}</tr>)}
          </tbody>
        </table>
        <div className="space-y-2">
          {mode === 'mendel' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Readout label="Genotypes" value={Object.entries(r.counts).map(([g, n]) => `${n} ${g}`).join(' : ')} />
              <Readout label="Phenotypes" value={`${r.dominant} ${t.dom.toLowerCase()} : ${r.recessive} ${t.rec.toLowerCase()}`} />
            </div>
          ) : <Readout label="Chance of a boy" value="2 in 4 = 50%" />}
          <Button variant="outline" onClick={simulate}>🌱 Grow 1000 offspring</Button>
          {sim && <p className="text-sm">{mode === 'sex' ? `${sim.d} boys and ${sim.r} girls` : `${sim.d} ${t.dom.toLowerCase()} and ${sim.r} ${t.rec.toLowerCase()}`}: close to the predicted ratio, but chance makes it wobble.</p>}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{mode === 'sex' ? <>Mothers pass on an X chromosome in every egg; fathers pass on either X or Y in their sperm. So it is the <b>father's</b> sperm that decides whether the baby is a boy (XY) or a girl (XX), with a 50% chance of each.</> : <>Gregor Mendel crossed pea plants in the 1860s. A <b>dominant</b> allele (T) shows whenever it is present; a <b>recessive</b> allele (t) shows only when there are two copies (tt). Crossing two Tt plants gives a <b>3 : 1</b> ratio of tall to short.</>}</p>
    </LabFrame>
  )
}
