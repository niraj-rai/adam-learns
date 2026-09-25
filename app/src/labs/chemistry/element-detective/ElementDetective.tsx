import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { CATEGORY_STYLE, ELEMENTS } from '../../_kit/elements'
import { LabFrame } from '../../_kit/LabFrame'

const RIDDLES: { answer: number; clues: string[] }[] = [
  { answer: 11, clues: ['I am a soft metal stored under kerosene.', 'I have 11 protons.', 'I am half of the salt on your dinner table.'] },
  { answer: 6, clues: ['I am a non-metal found in every living thing.', 'My atoms have 4 electrons in the outer shell.', 'I can be a diamond or a pencil lead.'] },
  { answer: 18, clues: ['I am a noble gas.', 'My electrons are arranged 2, 8, 8.', 'I make up about 1% of the air.'] },
  { answer: 9, clues: ['I am the most reactive non-metal.', 'I am a halogen in period 2.', 'Compounds of mine protect your teeth.'] },
  { answer: 12, clues: ['I am in group 2 and period 3.', 'I burn with a dazzling white light.', 'Every chlorophyll molecule has one of my atoms at its centre.'] },
  { answer: 2, clues: ['I have a full outer shell with just 2 electrons.', 'I am lighter than air.', 'I was first discovered in the light from the Sun.'] },
  { answer: 14, clues: ['I am a metalloid.', 'My electrons are arranged 2, 8, 4.', 'Computer chips are made from me.'] },
  { answer: 20, clues: ['I have 20 protons.', 'I am an alkaline earth metal.', 'I keep your bones and teeth strong.'] },
]

export default function ElementDetective() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [round, setRound] = useState(0)
  const riddles = useMemo(() => shuffle(RIDDLES), [round])
  const [i, setI] = useState(0)
  const [cluesShown, setCluesShown] = useState(1)
  const [points, setPoints] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const done = i >= riddles.length
  const r = riddles[i]
  const max = riddles.length * 3
  const stars = points >= max * 0.8 ? 3 : points >= max * 0.55 ? 2 : 1

  const guess = (z: number) => {
    if (picked !== null) return
    setPicked(z)
    if (z === r.answer) {
      setPoints((p) => p + (4 - cluesShown))
      sfx.correct()
    } else sfx.wrong()
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setCluesShown(1)
    setPicked(null)
    if (n >= riddles.length) {
      sfx.win()
      if (points >= max * 0.55) {
        if (!useProgress.getState().badges.includes('element-detective')) addXp(40, 'Element Detective!')
        awardBadge('element-detective')
      }
    }
  }

  return (
    <LabFrame labId="element-detective" title="Boss Challenge: Element Detective" subtitle="Identify 8 mystery elements from clues. Fewer clues = more points!" howTo={<p>Read the first clue and tap the element on the table. Stuck? Reveal another clue, but each one costs a point (3, 2 or 1 points per element).</p>}>
      {done && points >= max * 0.55 && <Confetti />}
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🔎</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{points} / {max} points {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
          <p className="mt-1 text-sm">{points >= max * 0.55 ? 'Element Detective badge earned!' : 'Score 55% or more to earn the Element Detective badge. Try again!'}</p>
          <Button className="mt-3" variant="outline" onClick={() => { setRound((x) => x + 1); setI(0); setPoints(0); setCluesShown(1); setPicked(null) }}>New mysteries</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Mystery {i + 1} / {riddles.length}</span>
            <span>Points: <b className="text-foreground">{points}</b></span>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4">
            <ol className="space-y-1.5">
              {r.clues.slice(0, cluesShown).map((c, k) => (
                <motion.li key={k} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-[15px]">🕵️ Clue {k + 1}: {c}</motion.li>
              ))}
            </ol>
            {cluesShown < 3 && picked === null && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setCluesShown((c) => c + 1)}>Reveal another clue (−1 point)</Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[560px] gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
              {[1, 2, 3, 4].flatMap((period) =>
                Array.from({ length: 18 }, (_, gi) => {
                  const e = ELEMENTS.find((x) => x.period === period && x.group === gi + 1)
                  if (!e) return <div key={`${period}-${gi}`} />
                  const isAnswer = picked !== null && e.z === r.answer
                  const isWrong = picked === e.z && e.z !== r.answer
                  return (
                    <button key={e.z} type="button" disabled={picked !== null} onClick={() => guess(e.z)} className={cn('flex aspect-square flex-col items-center justify-center rounded border border-black/15 text-slate-900', isAnswer && 'ring-4 ring-success', isWrong && 'ring-4 ring-destructive')} style={{ background: CATEGORY_STYLE[e.category].bg }} aria-label={e.name}>
                      <span className="text-[9px] leading-none">{e.z}</span>
                      <span className="font-heading text-sm font-bold">{e.symbol}</span>
                    </button>
                  )
                }),
              )}
            </div>
          </div>

          {picked !== null && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('rounded-xl p-3 text-sm', picked === r.answer ? 'bg-success-soft' : 'bg-warn-soft')}>
              {picked === r.answer ? `✅ Case closed: it's ${ELEMENTS.find((e) => e.z === r.answer)!.name}! +${4 - cluesShown} points.` : `❌ It was ${ELEMENTS.find((e) => e.z === r.answer)!.name}.`}
              <Button size="sm" className="ml-3" autoFocus onClick={next}>{i + 1 < riddles.length ? 'Next mystery →' : 'See results'}</Button>
            </motion.div>
          )}
        </div>
      )}
    </LabFrame>
  )
}
