import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { isAlive, THINGS, TRAITS } from './model'

export default function AliveLab() {
  const [i, setI] = useState(0)
  const [guess, setGuess] = useState<null | boolean>(null)
  const [score, setScore] = useState(0)
  const t = THINGS[i]
  const alive = isAlive(t)
  const choose = (g: boolean) => {
    if (guess !== null) return
    setGuess(g)
    if (g === alive) { setScore((s) => s + 1); sfx.correct() } else sfx.wrong()
  }
  const next = () => { setI((x) => (x + 1) % THINGS.length); setGuess(null) }
  return (
    <LabFrame labId="alive-lab" title="Is It Alive?" subtitle="Living things show ALL seven life processes. Many non-living things show a few of them!" howTo={<p>Decide whether each thing is living or non-living. Then check its life processes. Remember <b>MRS GREN</b>: Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition.</p>}>
      <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 rounded-2xl border bg-background p-5">
        <span className="text-6xl">{t.emoji}</span>
        <p className="font-heading text-xl font-semibold">{t.name}</p>
        <div className="flex gap-2">
          <Button disabled={guess !== null} onClick={() => choose(true)} variant={guess === true ? 'default' : 'outline'}>🌱 Living</Button>
          <Button disabled={guess !== null} onClick={() => choose(false)} variant={guess === false ? 'default' : 'outline'}>🪨 Non-living</Button>
        </div>
      </motion.div>
      {guess !== null && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
            {TRAITS.map((tr) => {
              const has = t.traits.includes(tr.id)
              return (
                <div key={tr.id} className={cn('rounded-lg border px-2 py-1.5 text-center text-xs', has ? 'border-success bg-success-soft' : 'opacity-60')}>
                  <div className="text-lg">{tr.emoji}</div>
                  {tr.name.split(' (')[0]} {has ? '✓' : '✗'}
                </div>
              )
            })}
          </div>
          <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', guess === alive ? 'bg-success-soft' : 'bg-warn-soft')}>
            {guess === alive ? '✅ ' : '❌ '}<b>{alive ? 'Living.' : 'Non-living.'}</b> {t.note}
          </p>
          <Button onClick={next}>Next →</Button>
        </div>
      )}
      <Readout className="mt-3" label="Score" value={`${score} correct`} />
    </LabFrame>
  )
}
