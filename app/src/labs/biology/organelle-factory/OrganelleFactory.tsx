import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ORGANELLES, visibleIn } from './model'

const CELL = 'M40,40 C120,5 250,20 290,80 C320,150 260,225 160,220 C60,230 10,170 20,110 C25,75 30,50 40,40 Z'

export default function OrganelleFactory() {
  const [type, setType] = useState<'plant' | 'animal'>('plant')
  const [sel, setSel] = useState('nucleus')
  const [quiz, setQuiz] = useState(false)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const list = ORGANELLES.filter((o) => visibleIn(o, type))
  const order = useMemo(() => shuffle(list.map((o) => o.id)), [type, quiz]) // eslint-disable-line react-hooks/exhaustive-deps
  const target = ORGANELLES.find((o) => o.id === order[round % order.length])!
  const o = ORGANELLES.find((x) => x.id === sel)!
  const click = (id: string) => {
    if (!quiz) { setSel(id); return }
    if (id === target.id) { sfx.correct(); setScore((s) => s + 1); setFeedback(`✅ Yes: that's the ${target.name.toLowerCase()}.`); setRound((r) => r + 1) }
    else { sfx.wrong(); setFeedback(`❌ That's the ${ORGANELLES.find((x) => x.id === id)!.name.toLowerCase()}. Try again!`) }
  }
  const hit = (id: string) => ({ onClick: () => click(id), className: 'cursor-pointer', role: 'button', 'aria-label': ORGANELLES.find((x) => x.id === id)!.name, tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') click(id) } })
  const glow = (id: string) => (!quiz && sel === id ? { stroke: '#f59e0b', strokeWidth: 4 } : {})
  return (
    <LabFrame labId="organelle-factory" title="Organelle Factory" subtitle="A cell works like a factory: every organelle has a job." howTo={<p>Tap any part of the cell to learn what it does and its factory job. Then switch on Find it! for a quiz.</p>}>
      <div className="flex flex-wrap items-center gap-2">
        {(['plant', 'animal'] as const).map((k) => <button key={k} type="button" aria-pressed={type === k} onClick={() => { setType(k); setSel('nucleus'); setRound(0) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', type === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{k === 'plant' ? '🌿 Plant cell' : '🐾 Animal cell'}</button>)}
        <Button size="sm" variant={quiz ? 'default' : 'outline'} className="ml-auto" onClick={() => { setQuiz((q) => !q); setRound(0); setScore(0); setFeedback(null) }}>{quiz ? '✋ Stop quiz' : '🎯 Find it!'}</Button>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 320 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${type} cell`}>
          {type === 'plant' ? <rect x={10} y={10} width={300} height={220} rx={10} fill="#bbf7d0" stroke="#65a30d" strokeWidth={10} {...hit('wall')} {...glow('wall')} /> : null}
          {type === 'plant'
            ? <><rect x={20} y={20} width={280} height={200} rx={8} fill="#dcfce7" {...hit('cytoplasm')} {...glow('cytoplasm')} /><rect x={20} y={20} width={280} height={200} rx={8} fill="none" stroke="#16a34a" strokeWidth={4} pointerEvents="stroke" {...hit('membrane')} {...glow('membrane')} /></>
            : <><path d={CELL} fill="#fde7f3" {...hit('cytoplasm')} {...glow('cytoplasm')} /><path d={CELL} fill="none" stroke="#db2777" strokeWidth={5} pointerEvents="stroke" {...hit('membrane')} {...glow('membrane')} /></>}
          {type === 'plant' && <ellipse cx={175} cy={130} rx={95} ry={60} fill="#e0f2fe" stroke="#0ea5e9" strokeWidth={1.5} {...hit('vacuole')} {...glow('vacuole')} />}
          <circle cx={type === 'plant' ? 70 : 150} cy={type === 'plant' ? 70 : 115} r={28} fill="#c4b5fd" stroke="#6d28d9" strokeWidth={2} {...hit('nucleus')} {...glow('nucleus')} />
          <circle cx={type === 'plant' ? 66 : 146} cy={type === 'plant' ? 66 : 111} r={8} fill="#6d28d9" pointerEvents="none" />
          {[[240, 50], [110, 190], [60, 150]].map(([x, y], i) => <ellipse key={i} cx={type === 'plant' ? x : x - 10} cy={type === 'plant' ? y : y - 5} rx={18} ry={9} fill="#fb923c" stroke="#c2410c" strokeWidth={1.5} transform={`rotate(${i * 40} ${x} ${y})`} {...hit('mitochondria')} {...glow('mitochondria')} />)}
          {type === 'plant' && [[270, 110], [140, 50], [270, 190], [40, 200]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={14} ry={8} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} {...hit('chloroplast')} {...glow('chloroplast')} />)}
          <path d={type === 'plant' ? 'M100,70 q10,-12 20,0 t20,0 t20,0 M100,82 q10,-12 20,0 t20,0 t20,0' : 'M185,100 q10,-12 20,0 t20,0 t20,0 M185,112 q10,-12 20,0 t20,0 t20,0 M185,124 q10,-12 20,0 t20,0 t20,0'} fill="none" stroke="#0891b2" strokeWidth={4} {...hit('er')} {...glow('er')} />
          <path d={type === 'plant' ? 'M200,200 q15,-8 30,0 M203,208 q12,-6 24,0 M206,216 q9,-4 18,0' : 'M90,165 q15,-8 30,0 M93,173 q12,-6 24,0 M96,181 q9,-4 18,0'} fill="none" stroke="#ca8a04" strokeWidth={4} {...hit('golgi')} {...glow('golgi')} />
          {(type === 'plant' ? [[105, 110], [125, 100], [40, 110]] : [[200, 60], [215, 160], [230, 190], [110, 70], [80, 110]]).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#1e293b" {...hit('ribosomes')} {...glow('ribosomes')} />)}
          {(type === 'plant' ? [[240, 150]] : [[250, 140], [70, 200]]).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#fda4af" stroke="#be123c" strokeWidth={1.5} {...hit('lysosome')} {...glow('lysosome')} />)}
        </svg>
        <div className="space-y-3">
          {quiz ? (
            <div className="rounded-2xl border-2 border-chem bg-chem-soft p-4">
              <p className="text-xs font-semibold uppercase">Find it! · score {score}</p>
              <p className="mt-1 font-heading text-lg">Tap the part that {target.clue}.</p>
              {feedback && <p className="mt-2 text-sm">{feedback}</p>}
            </div>
          ) : (
            <div className="rounded-2xl border p-4">
              <p className="font-heading text-2xl font-semibold">{o.emoji} {o.name}</p>
              <p className="mt-1">{o.job}</p>
              <p className="mt-2 text-sm text-muted-foreground">🏭 Factory job: {o.factory}</p>
              {o.plantOnly && <p className="mt-2 text-xs font-semibold text-green-700 dark:text-green-400">🌿 Found in plant cells, not animal cells</p>}
            </div>
          )}
          <div className="flex flex-wrap gap-1">{list.map((x) => <button key={x.id} type="button" onClick={() => click(x.id)} className={cn('rounded-full border px-2 py-0.5 text-xs', !quiz && sel === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}</div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Organelles are structures inside a cell, each with a job. Most, like the nucleus, mitochondria, ER, Golgi and lysosomes, are wrapped in their own membrane. Plant cells also have a cellulose wall, chloroplasts and a large vacuole.</p>
    </LabFrame>
  )
}
