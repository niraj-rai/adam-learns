import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Card = { emoji: string; name: string; matter: boolean; why: string }

const CARDS: Card[] = [
  { emoji: '🪨', name: 'A rock', matter: true, why: 'It has mass and takes up space.' },
  { emoji: '💨', name: 'Air in a balloon', matter: true, why: 'Air is a mixture of gases. It has mass and fills the balloon, so it takes up space.' },
  { emoji: '💡', name: 'Light from a bulb', matter: false, why: 'Light is a form of energy. It has no mass and does not take up space.' },
  { emoji: '🔊', name: 'Sound of a drum', matter: false, why: 'Sound is energy travelling through matter as vibrations. The sound itself is not matter.' },
  { emoji: '🪔', name: 'Smell of an agarbatti', matter: true, why: 'You smell tiny particles of the incense that have spread through the air. Those particles are matter.' },
  { emoji: '😊', name: 'Happiness', matter: false, why: 'Feelings and thoughts have no mass and take up no space.' },
  { emoji: '♨️', name: 'Steam from a cooker', matter: true, why: 'Steam is water in the gas state. It is still matter.' },
  { emoji: '🌡️', name: 'Heat from the sun', matter: false, why: 'Heat is energy being transferred. It is not made of particles of matter.' },
  { emoji: '🌫️', name: 'Dust in a sunbeam', matter: true, why: 'Dust is made of tiny solid particles. The sunbeam just helps you see them.' },
  { emoji: '🌈', name: 'A rainbow', matter: false, why: 'A rainbow is light split into colours by raindrops. The raindrops are matter; the rainbow itself is light.' },
  { emoji: '🥛', name: 'Milk', matter: true, why: 'Milk is a liquid mixture. It has mass and takes up space.' },
  { emoji: '👤', name: 'Your shadow', matter: false, why: 'A shadow is just a place where light is blocked. There is nothing there to weigh.' },
]

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatterOrNot() {
  const [round, setRound] = useState(0)
  const deck = useMemo(() => shuffle(CARDS), [round])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)

  const card = deck[index]
  const done = index >= deck.length

  const choose = (matter: boolean) => {
    if (answer !== null) return
    setAnswer(matter)
    if (matter === card.matter) {
      setScore((s) => s + 1)
      sfx.correct()
    } else sfx.wrong()
  }

  const next = () => {
    setAnswer(null)
    setIndex((i) => i + 1)
  }

  return (
    <LabFrame labId="matter-or-not" title="Matter or Not?" subtitle="Does it have mass and take up space?">
      <div className="mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Card {Math.min(index + 1, deck.length)} / {deck.length}
          </span>
          <span>
            Score: <b className="text-foreground">{score}</b>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border bg-chem-soft p-6 text-center"
            >
              <p className="text-5xl">{score >= 10 ? '🏆' : score >= 7 ? '👏' : '🔁'}</p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                {score} / {deck.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The test is always the same: <b>does it have mass</b> and <b>does it take up space</b>?
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setRound((r) => r + 1)
                  setIndex(0)
                  setScore(0)
                  setAnswer(null)
                }}
              >
                Play again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={`${round}-${index}`}
              initial={{ opacity: 0, x: 40, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -40, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={cn(
                'rounded-2xl border-2 bg-background p-6 text-center shadow-sm',
                answer !== null && (answer === card.matter ? 'border-success' : 'border-destructive'),
              )}
            >
              <p className="text-6xl" aria-hidden>
                {card.emoji}
              </p>
              <p className="mt-3 font-heading text-2xl font-semibold">{card.name}</p>

              {answer === null ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button size="lg" className="h-12 text-base" onClick={() => choose(true)}>
                    ✅ Matter
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 text-base" onClick={() => choose(false)}>
                    🚫 Not matter
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3" role="status">
                  <p className={cn('font-semibold', answer === card.matter ? 'text-success' : 'text-destructive')}>
                    {answer === card.matter ? 'Correct!' : 'Not quite.'} It is {card.matter ? '' : 'not '}matter.
                  </p>
                  <p className="text-sm text-muted-foreground">{card.why}</p>
                  <Button onClick={next} autoFocus>
                    Next card →
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
