import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type T = 'Combination' | 'Decomposition' | 'Displacement' | 'Double displacement'
const TYPES: { t: T; pattern: string; emoji: string }[] = [
  { t: 'Combination', pattern: 'A + B → AB', emoji: '🤝' },
  { t: 'Decomposition', pattern: 'AB → A + B', emoji: '💔' },
  { t: 'Displacement', pattern: 'A + BC → AC + B', emoji: '🔁' },
  { t: 'Double displacement', pattern: 'AB + CD → AD + CB', emoji: '💃' },
]
const CARDS: { eq: string; t: T; seen: string }[] = [
  { eq: 'CaO + H₂O → Ca(OH)₂', t: 'Combination', seen: 'Quicklime hisses and gets very hot with water: slaked lime for whitewashing.' },
  { eq: '2Mg + O₂ → 2MgO', t: 'Combination', seen: 'A dazzling white flame; white powder is left.' },
  { eq: 'C + O₂ → CO₂', t: 'Combination', seen: 'Burning coal.' },
  { eq: 'CaCO₃ → CaO + CO₂', t: 'Decomposition', seen: 'Heating limestone in a kiln makes quicklime (thermal decomposition).' },
  { eq: '2H₂O → 2H₂ + O₂', t: 'Decomposition', seen: 'Bubbles of gas at both electrodes: twice as much hydrogen (electrolysis).' },
  { eq: '2AgCl → 2Ag + Cl₂', t: 'Decomposition', seen: 'White silver chloride turns grey in sunlight (photolysis), used in old photography.' },
  { eq: 'Fe + CuSO₄ → FeSO₄ + Cu', t: 'Displacement', seen: 'A brown coat forms on the iron nail and the blue solution turns pale green.' },
  { eq: 'Zn + 2HCl → ZnCl₂ + H₂', t: 'Displacement', seen: 'Fizzing: the gas burns with a pop.' },
  { eq: 'Na₂SO₄ + BaCl₂ → BaSO₄ + 2NaCl', t: 'Double displacement', seen: 'A white precipitate (insoluble solid) forms immediately.' },
  { eq: 'NaOH + HCl → NaCl + H₂O', t: 'Double displacement', seen: 'Neutralisation: the mixture warms up.' },
]

export default function ReactionTypes() {
  const cards = useMemo(() => shuffle(CARDS), [])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<T | null>(null)
  const [score, setScore] = useState(0)
  const card = cards[i % cards.length]
  const choose = (t: T) => { if (picked) return; setPicked(t); if (t === card.t) { sfx.correct(); setScore((s) => s + 1) } else sfx.wrong() }
  return (
    <LabFrame labId="reaction-types" title="Types of Reactions" subtitle="Most reactions fit one of four patterns: combination, decomposition, displacement and double displacement." howTo={<p>Read the equation and what you would see, then choose the type of reaction. Look at how the atoms swap partners.</p>}>
      <div className="grid gap-2 sm:grid-cols-4">{TYPES.map((x) => <div key={x.t} className="rounded-xl border p-2 text-center text-xs"><p className="text-xl">{x.emoji}</p><p className="font-semibold">{x.t}</p><p className="font-mono text-muted-foreground">{x.pattern}</p></div>)}</div>
      <div className="mt-3 rounded-2xl bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">Card {(i % cards.length) + 1} of {cards.length} · score {score}</p>
        <p className="mt-1 font-mono text-xl">{card.eq}</p>
        <p className="mt-1 text-sm">👀 {card.seen}</p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{TYPES.map((x) => <button key={x.t} type="button" disabled={Boolean(picked)} onClick={() => choose(x.t)} className={cn('rounded-xl border-2 px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && x.t === card.t && 'border-success bg-success-soft', picked === x.t && x.t !== card.t && 'border-destructive/60 bg-destructive/10')}>{x.emoji} {x.t}</button>)}</div>
      {picked && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span>{picked === card.t ? '✅ Correct!' : `❌ It's ${card.t.toLowerCase()}.`}</span><Button size="sm" onClick={() => { setI((x) => x + 1); setPicked(null) }}>Next card →</Button></div>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Reactions can also be described by energy: <b>exothermic</b> reactions give out heat (burning, respiration, quicklime and water); <b>endothermic</b> ones take it in (decomposing limestone, photosynthesis). A <b>precipitation</b> reaction is a double displacement that makes an insoluble solid.</p>
    </LabFrame>
  )
}
