import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { TISSUES } from './model'

const C = 120

export default function StemSection() {
  const [sel, setSel] = useState('xylem')
  const [quiz, setQuiz] = useState(false)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [fb, setFb] = useState<string | null>(null)
  const order = useMemo(() => shuffle(TISSUES.map((t) => t.id)), [quiz])
  const target = TISSUES.find((t) => t.id === order[round % order.length])!
  const t = TISSUES.find((x) => x.id === sel)!
  const click = (id: string) => {
    if (!quiz) { setSel(id); return }
    if (id === target.id) { sfx.correct(); setScore((s) => s + 1); setFb(`✅ Yes, ${target.name.toLowerCase()}.`); setRound((r) => r + 1) }
    else { sfx.wrong(); setFb(`❌ That's ${TISSUES.find((x) => x.id === id)!.name.toLowerCase()}.`) }
  }
  const hit = (id: string) => ({ onClick: () => click(id), className: 'cursor-pointer', role: 'button' as const, 'aria-label': TISSUES.find((x) => x.id === id)!.name, tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') click(id) } })
  const on = (id: string) => (!quiz && sel === id ? { stroke: '#f59e0b', strokeWidth: 4 } : {})
  const bundles = Array.from({ length: 8 }, (_, i) => (2 * Math.PI * i) / 8)
  return (
    <LabFrame labId="stem-section" title="Inside a Stem" subtitle="A plant stem is built from different tissues, each with a job." howTo={<p>Tap a region of the stem cross-section or the root tip to find out which tissue it is. Then try Find it!</p>}>
      <div className="flex justify-end"><Button size="sm" variant={quiz ? 'default' : 'outline'} onClick={() => { setQuiz((q) => !q); setRound(0); setScore(0); setFb(null) }}>{quiz ? '✋ Stop quiz' : '🎯 Find it!'}</Button></div>
      <div className="mt-2 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 340 250" className="w-full rounded-2xl border bg-background" role="img" aria-label="Cross-section of a stem and a root tip">
          <circle cx={C} cy={C} r={108} fill="#a3e635" stroke="#3f6212" strokeWidth={5} {...hit('epidermis')} {...on('epidermis')} />
          <circle cx={C} cy={C} r={100} fill="#d9f99d" {...hit('collenchyma')} {...on('collenchyma')} />
          <circle cx={C} cy={C} r={88} fill="#ecfccb" {...hit('parenchyma')} {...on('parenchyma')} />
          <circle cx={C} cy={C} r={50} fill="none" stroke="#65a30d" strokeWidth={2} strokeDasharray="3 3" {...hit('cambium')} {...on('cambium')} />
          {bundles.map((a, i) => {
            const x = C + 62 * Math.cos(a)
            const y = C + 62 * Math.sin(a)
            const xi = C + 44 * Math.cos(a)
            const yi = C + 44 * Math.sin(a)
            const xs = C + 80 * Math.cos(a)
            const ys = C + 80 * Math.sin(a)
            return (
              <g key={i}>
                <circle cx={xs} cy={ys} r={6} fill="#78716c" {...hit('sclerenchyma')} {...on('sclerenchyma')} />
                <circle cx={x} cy={y} r={11} fill="#fbbf24" {...hit('phloem')} {...on('phloem')} />
                <circle cx={xi} cy={yi} r={10} fill="#dc2626" {...hit('xylem')} {...on('xylem')} />
              </g>
            )
          })}
          <text x={C} y={C + 4} textAnchor="middle" fontSize={9} fill="#3f6212" pointerEvents="none">pith</text>
          <g transform="translate(270,20)">
            <text x={25} y={0} textAnchor="middle" fontSize={10} fill="currentColor">root tip</text>
            <path d="M5,10 L45,10 L45,150 Q25,200 5,150 Z" fill="#fef3c7" stroke="#a16207" strokeWidth={2} />
            <path d="M8,150 Q25,190 42,150 L42,135 L8,135 Z" fill="#fb7185" {...hit('meristem')} {...on('meristem')} />
            <path d="M10,170 Q25,215 40,170" fill="none" stroke="#a16207" strokeDasharray="3 2" />
          </g>
          <g fontSize={9} fill="currentColor">
            <circle cx={20} cy={236} r={4} fill="#dc2626" /><text x={27} y={239}>xylem</text>
            <circle cx={70} cy={236} r={4} fill="#fbbf24" /><text x={77} y={239}>phloem</text>
            <circle cx={125} cy={236} r={4} fill="#78716c" /><text x={132} y={239}>fibres</text>
          </g>
        </svg>
        <div className="space-y-3">
          {quiz ? (
            <div className="rounded-2xl border-2 border-chem bg-chem-soft p-4">
              <p className="text-xs font-semibold uppercase">Find it! · score {score}</p>
              <p className="mt-1 font-heading text-lg">Tap the tissue that {target.clue}.</p>
              {fb && <p className="mt-2 text-sm">{fb}</p>}
            </div>
          ) : (
            <div className="rounded-2xl border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t.group}</p>
              <p className="font-heading text-2xl font-semibold">{t.name}</p>
              <p className="mt-2 text-sm"><b>Cells:</b> {t.cells}</p>
              <p className="mt-1 text-sm"><b>Job:</b> {t.job}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1">{TISSUES.map((x) => <button key={x.id} type="button" onClick={() => click(x.id)} className={cn('rounded-full border px-2 py-0.5 text-xs', !quiz && sel === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}</div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Meristematic tissue</b> keeps dividing to make new cells (at tips for length, in the cambium for thickness). Its cells then specialise into <b>permanent tissues</b>: simple ones made of one cell type (parenchyma, collenchyma, sclerenchyma) and complex ones made of several (xylem and phloem).</p>
    </LabFrame>
  )
}
