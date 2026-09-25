import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Kind = 'physical' | 'chemical' | 'both'
type Clue = 'new' | 'colour' | 'gas' | 'energy' | 'reversible' | 'shape'

const CLUES: Record<Clue, string> = {
  new: '🆕 New substance formed',
  colour: '🎨 Colour change',
  gas: '💨 Gas or new smell',
  energy: '🔥 Heat or light given out',
  reversible: '↩️ Easy to reverse',
  shape: '✂️ Only shape, size or state changed',
}

type Card = { before: string; after: string; name: string; kind: Kind; clues: Clue[]; why: string }

const CARDS: Card[] = [
  { before: '🍦', after: '🥛', name: 'Ice cream melting', kind: 'physical', clues: ['shape', 'reversible'], why: 'Only the state changes (solid → liquid). Freeze it and it is ice cream again. No new substance.' },
  { before: '📄', after: '🔥', name: 'Burning paper', kind: 'chemical', clues: ['new', 'energy', 'gas', 'colour'], why: 'Paper turns into ash, smoke and gases, giving out heat and light. You can never get the paper back.' },
  { before: '🫓', after: '🥞', name: 'Cooking a dosa on a tawa', kind: 'chemical', clues: ['new', 'colour', 'gas'], why: 'The batter turns golden-brown with a new smell and taste. New substances form, and you cannot "uncook" it.' },
  { before: '🍬', after: '🥤', name: 'Dissolving sugar in water', kind: 'physical', clues: ['reversible'], why: 'The sugar particles spread out between water particles. Evaporate the water and the sugar comes back.' },
  { before: '🥛', after: '🥣', name: 'Milk setting into curd', kind: 'chemical', clues: ['new', 'shape'], why: 'Bacteria turn the milk sugar into lactic acid: a new sour taste and thick texture. Curd cannot become milk again.' },
  { before: '🥕', after: '🔪', name: 'Chopping carrots', kind: 'physical', clues: ['shape'], why: 'Only the size and shape change. Each piece is still carrot.' },
  { before: '🔩', after: '🟫', name: 'An iron gate rusting', kind: 'chemical', clues: ['new', 'colour'], why: 'Iron reacts with oxygen and water to form rust (iron oxide), a new flaky brown substance.' },
  { before: '💧', after: '♨️', name: 'Water boiling', kind: 'physical', clues: ['shape', 'reversible'], why: 'Liquid water becomes steam. Cool it and it condenses back to water. Still H₂O.' },
  { before: '🟢', after: '🥭', name: 'A mango ripening', kind: 'chemical', clues: ['new', 'colour', 'gas'], why: 'The colour, sweetness and smell change as new substances are made inside the fruit. It cannot unripen.' },
  { before: '🪢', after: '↔️', name: 'Stretching a rubber band', kind: 'physical', clues: ['shape', 'reversible'], why: 'Only the shape changes, and it springs back.' },
  { before: '🕯️', after: '🔥', name: 'A burning candle', kind: 'both', clues: ['new', 'energy', 'gas', 'reversible', 'shape'], why: 'BOTH! The wax melts (physical, reversible) AND the wax vapour burns to make carbon dioxide and water, giving out heat and light (chemical).' },
  { before: '🎇', after: '✨', name: 'A Diwali sparkler', kind: 'chemical', clues: ['new', 'energy', 'gas'], why: 'Metal powders burn with bright light, heat and smoke. New substances form.' },
  { before: '🧊', after: '🧊', name: 'Freezing water into ice cubes', kind: 'physical', clues: ['shape', 'reversible'], why: 'Liquid → solid. Melt it and it is water again.' },
  { before: '🍛', after: '⚡', name: 'Digesting your lunch', kind: 'chemical', clues: ['new', 'energy'], why: 'Your body breaks food into new, simpler substances and releases energy from them.' },
]

export default function ChangeDetective() {
  const [round, setRound] = useState(0)
  const deck = useMemo(() => shuffle(CARDS).slice(0, 10), [round])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<Kind | null>(null)
  const [clues, setClues] = useState<Clue[]>([])
  const [score, setScore] = useState(0)

  const card = deck[index]
  const done = index >= deck.length

  const choose = (k: Kind) => {
    if (answer) return
    setAnswer(k)
    if (k === card.kind) {
      setScore((s) => s + 1)
      sfx.correct()
    } else sfx.wrong()
  }

  return (
    <LabFrame
      labId="change-detective"
      title="Change Detective"
      subtitle="Physical change, chemical change, or both?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Look at the <b>before → after</b>. First tick the clues you notice (optional), then decide.</li>
          <li>Physical change: no new substance, often easy to reverse.</li>
          <li>Chemical change: a new substance forms, often with colour, gas, heat or light.</li>
        </ul>
      }
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-3 flex justify-between text-sm text-muted-foreground">
          <span>
            Case {Math.min(index + 1, deck.length)} / {deck.length}
          </span>
          <span>
            Score: <b className="text-foreground">{score}</b>
          </span>
        </div>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border bg-chem-soft p-6 text-center">
              <p className="text-5xl">{score >= 9 ? '🕵️' : score >= 6 ? '👏' : '🔁'}</p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                {score} / {deck.length} cases solved
              </p>
              <p className="mt-1 text-sm text-muted-foreground">The key question: <b>was a new substance formed?</b></p>
              <Button
                className="mt-4"
                onClick={() => {
                  setRound((r) => r + 1)
                  setIndex(0)
                  setScore(0)
                  setAnswer(null)
                  setClues([])
                }}
              >
                New cases
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={`${round}-${index}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className={cn('rounded-2xl border-2 bg-background p-5', answer && (answer === card.kind ? 'border-success' : 'border-destructive'))}
            >
              <div className="flex items-center justify-center gap-4 text-6xl" aria-hidden>
                <span>{card.before}</span>
                <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-3xl text-muted-foreground">
                  →
                </motion.span>
                <span>{card.after}</span>
              </div>
              <p className="mt-3 text-center font-heading text-2xl font-semibold">{card.name}</p>

              <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase">Clues you notice</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(Object.keys(CLUES) as Clue[]).map((c) => {
                  const on = clues.includes(c)
                  const actual = card.clues.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={Boolean(answer)}
                      onClick={() => setClues((x) => (on ? x.filter((y) => y !== c) : [...x, c]))}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs',
                        on && !answer && 'border-primary bg-primary/10',
                        answer && actual && 'border-success bg-success-soft',
                        answer && on && !actual && 'border-destructive/60 line-through',
                      )}
                    >
                      {CLUES[c]}
                    </button>
                  )
                })}
              </div>

              {!answer ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button size="lg" variant="outline" onClick={() => choose('physical')}>
                    Physical
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => choose('chemical')}>
                    Chemical
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => choose('both')}>
                    Both
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-center" role="status">
                  <p className={cn('font-semibold', answer === card.kind ? 'text-success' : 'text-destructive')}>
                    {answer === card.kind ? 'Case solved!' : 'Not quite.'} It is a <b>{card.kind === 'both' ? 'physical AND chemical' : card.kind}</b> change.
                  </p>
                  <p className="text-sm text-muted-foreground">{card.why}</p>
                  <Button
                    autoFocus
                    onClick={() => {
                      setIndex((i) => i + 1)
                      setAnswer(null)
                      setClues([])
                    }}
                  >
                    Next case →
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LabFrame>
  )
}
