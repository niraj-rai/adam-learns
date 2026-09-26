import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffleNotIdentity } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

/** needs: indexes of steps that must come first (independent steps can go in any order). */
type Step = { s: string; r: string; needs: number[] }
const PROOFS: { title: string; given: string; prove: string; figure: string; steps: Step[] }[] = [
  { title: 'Vertically opposite angles', given: 'Lines AB and CD cross at O.', prove: '∠AOC = ∠BOD', figure: '✖️',
    steps: [
      { s: '∠AOC + ∠AOD = 180°', r: 'Linear pair on line CD', needs: [] },
      { s: '∠AOD + ∠BOD = 180°', r: 'Linear pair on line AB', needs: [] },
      { s: '∠AOC + ∠AOD = ∠AOD + ∠BOD', r: 'Both equal 180°', needs: [0, 1] },
      { s: '∠AOC = ∠BOD', r: 'Subtract ∠AOD from both sides', needs: [2] },
    ] },
  { title: 'Angle sum of a triangle', given: 'Triangle ABC. Draw line PQ through A parallel to BC.', prove: '∠A + ∠B + ∠C = 180°', figure: '🔺',
    steps: [
      { s: '∠PAB = ∠B', r: 'Alternate angles, PQ ∥ BC', needs: [] },
      { s: '∠QAC = ∠C', r: 'Alternate angles, PQ ∥ BC', needs: [] },
      { s: '∠PAB + ∠BAC + ∠QAC = 180°', r: 'Angles on the straight line PQ', needs: [] },
      { s: '∠B + ∠A + ∠C = 180°', r: 'Substitute the equal angles', needs: [0, 1, 2] },
    ] },
  { title: 'Isosceles base angles', given: 'In △ABC, AB = AC. AD bisects ∠A, meeting BC at D.', prove: '∠B = ∠C', figure: '📐',
    steps: [
      { s: 'AB = AC', r: 'Given', needs: [] },
      { s: '∠BAD = ∠CAD', r: 'AD bisects ∠A', needs: [] },
      { s: 'AD = AD', r: 'Common side', needs: [] },
      { s: '△ABD ≅ △ACD', r: 'SAS congruence', needs: [0, 1, 2] },
      { s: '∠B = ∠C', r: 'Corresponding parts of congruent triangles (CPCT)', needs: [3] },
    ] },
]

export default function ProofBuilder() {
  const [pi, setPi] = useState(0)
  const pr = PROOFS[pi]
  const shuffled = useMemo(() => shuffleNotIdentity(pr.steps), [pr])
  const [chosen, setChosen] = useState<Step[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const done = chosen.length === pr.steps.length
  const pick = (st: Step) => {
    if (chosen.includes(st)) return
    const ready = st.needs.every((k) => chosen.includes(pr.steps[k]))
    if (ready) { setChosen((c) => [...c, st]); setWrong(null); if (chosen.length + 1 === pr.steps.length) sfx.win(); else sfx.click() }
    else { setWrong(st.s); sfx.wrong() }
  }
  const choose = (i: number) => { setPi(i); setChosen([]); setWrong(null) }
  return (
    <LabFrame labId="proof-builder" title="Proof Builder" subtitle="A proof is a chain of statements, each backed by a reason, from what is given to what you want to show." howTo={<p>Pick a theorem. Tap the statements in the correct logical order. Each must follow from what came before.</p>}>
      <div className="flex flex-wrap gap-1">{PROOFS.map((p, i) => <button key={p.title} type="button" aria-pressed={pi === i} onClick={() => choose(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pi === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{p.figure} {p.title}</button>)}</div>
      <div className="mt-3 rounded-2xl bg-muted/50 p-3 text-sm"><p><b>Given:</b> {pr.given}</p><p><b>To prove:</b> {pr.prove}</p></div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Statements to use</p>
          <div className="space-y-2">{shuffled.map((st) => <button key={st.s} type="button" disabled={chosen.includes(st)} onClick={() => pick(st)} className={cn('block w-full rounded-xl border-2 px-3 py-2 text-left font-mono text-sm', chosen.includes(st) ? 'opacity-30' : 'hover:border-chem', wrong === st.s && 'border-destructive/60 bg-destructive/10')}>{st.s}</button>)}</div>
          {wrong && <p className="mt-2 text-sm text-destructive">Not yet: that statement needs something that hasn't been shown. What must come first?</p>}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Your proof</p>
          <ol className="space-y-2">{chosen.map((st, i) => <li key={st.s} className="rounded-xl border bg-background px-3 py-2 text-sm"><span className="font-mono">{i + 1}. {st.s}</span><span className="block text-xs text-muted-foreground">Reason: {st.r}</span></li>)}</ol>
          {done && <p className="mt-2 rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold">✅ Proved: {pr.prove}. ∎</p>}
          <Button className="mt-2" variant="outline" size="sm" onClick={() => choose(pi)}>↺ Start again</Button>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Euclid built all of geometry from a few <b>axioms</b> and <b>postulates</b> (statements accepted without proof) and proved everything else as <b>theorems</b>. A good proof gives a reason for every step: a definition, an axiom, or a theorem already proved.</p>
    </LabFrame>
  )
}
