import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { CHALLENGES, COMPONENTS, TOOLS, applyTool, isSolved, type Challenge, type ComponentId, type Mix, type ToolId } from './model'

type Step = { tool: ToolId; ok: boolean; message: string }

export default function SeparationBench({ challenges }: { challenges?: string[] }) {
  const list = challenges ? CHALLENGES.filter((c) => challenges.includes(c.id)) : CHALLENGES
  const [challenge, setChallenge] = useState<Challenge>(list[0])
  const [main, setMain] = useState<Mix>({ items: list[0].start, dissolved: list[0].dissolved ?? [] })
  const [piles, setPiles] = useState<ComponentId[][]>([])
  const [lost, setLost] = useState<ComponentId[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [solvedIds, setSolvedIds] = useState<string[]>([])

  const solved = isSolved(challenge, main, piles)
  const originals = new Set(challenge.start)
  const stuck = piles.some((p) => p.filter((c) => originals.has(c)).length > 1)
  const toolSteps = steps.filter((s) => s.ok).length
  const wrongTries = steps.filter((s) => !s.ok).length
  const stars = solved ? (toolSteps <= challenge.ideal.length && wrongTries === 0 ? 3 : wrongTries <= 2 ? 2 : 1) : 0

  const start = (c: Challenge) => {
    setChallenge(c)
    setMain({ items: c.start, dissolved: c.dissolved ?? [] })
    setPiles([])
    setLost([])
    setSteps([])
  }

  const use = (tool: ToolId) => {
    if (solved || stuck) return
    const r = applyTool(tool, main)
    setSteps((s) => [...s, { tool, ok: r.ok, message: r.message }])
    if (!r.ok) {
      sfx.wrong()
      return
    }
    sfx.click()
    setMain(r.next)
    if (r.removed?.length) setPiles((p) => [...p, r.removed!])
    if (r.lost?.length) setLost((l) => [...l, ...r.lost!])
    const newPiles = r.removed?.length ? [...piles, r.removed] : piles
    if (isSolved(challenge, r.next, newPiles)) {
      sfx.win()
      setSolvedIds((s) => (s.includes(challenge.id) ? s : [...s, challenge.id]))
    }
  }

  const chip = (c: ComponentId, dissolved = false) => (
    <motion.span
      layout
      key={c}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-sm', dissolved && 'border-dashed opacity-70')}
    >
      <span aria-hidden>{COMPONENTS[c].emoji}</span> {COMPONENTS[c].name}
      {dissolved && <span className="text-xs text-muted-foreground">(dissolved)</span>}
    </motion.span>
  )

  const lostOriginal = lost.filter((c) => originals.has(c))

  return (
    <LabFrame
      labId="separation-bench"
      title="Separation Bench"
      subtitle="Choose the right tools to separate each mixture"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Pick a challenge, then tap tools to use them on the mixture in the bowl.</li>
          <li>Think about the <b>property</b> that is different: size, weight, magnetism, or whether it dissolves.</li>
          <li>Solve it in the fewest steps, with no wrong tries, for ⭐⭐⭐.</li>
        </ul>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => start(c)}
            className={cn('rounded-full border px-3 py-1.5 text-sm', c.id === challenge.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}
          >
            {c.emoji} {c.title} {solvedIds.includes(c.id) && '✅'}
          </button>
        ))}
      </div>

      <p className="mb-3 rounded-xl bg-muted/50 px-4 py-2 text-[15px]">
        <b>{challenge.emoji} {challenge.title}:</b> {challenge.story}
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-dashed p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">🥣 In the bowl</p>
            <div className="flex min-h-9 flex-wrap gap-2">
              <AnimatePresence>
                {main.items.length === 0 ? <span className="text-sm text-muted-foreground">Empty</span> : main.items.map((c) => chip(c, main.dissolved.includes(c)))}
              </AnimatePresence>
            </div>
          </div>
          {piles.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {piles.map((p, i) => (
                <div key={i} className={cn('rounded-xl border p-3', p.filter((c) => originals.has(c)).length > 1 ? 'border-destructive/50 bg-destructive/5' : 'bg-success-soft')}>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Separated pile {i + 1}</p>
                  <div className="flex flex-wrap gap-1.5">{p.map((c) => chip(c))}</div>
                </div>
              ))}
            </div>
          )}
          {lost.length > 0 && <p className="text-xs text-muted-foreground">💨 Evaporated away: {lost.map((c) => COMPONENTS[c].name).join(', ')}</p>}

          <div className="space-y-1.5" aria-live="polite">
            {steps.slice(-3).map((s, i) => (
              <motion.p key={steps.length - 3 + i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-lg px-3 py-2 text-sm', s.ok ? 'bg-background' : 'bg-warn-soft')}>
                {TOOLS.find((t) => t.id === s.tool)!.emoji} {s.message}
              </motion.p>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Tools</p>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.hint}
                disabled={solved || stuck}
                onClick={() => use(t.id)}
                className="flex flex-col items-center gap-0.5 rounded-xl border-2 bg-background px-2 py-2.5 text-center text-xs font-semibold transition hover:border-chem disabled:opacity-50"
              >
                <span className="text-2xl" aria-hidden>{t.emoji}</span>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(solved || stuck) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('mt-4 rounded-2xl border p-4', solved ? 'border-success/50 bg-success-soft' : 'border-destructive/40 bg-destructive/5')}>
          {solved ? (
            <>
              <p className="font-heading text-xl font-semibold">
                {'⭐'.repeat(stars)}
                {'☆'.repeat(3 - stars)} Separated!
              </p>
              <p className="mt-1 text-sm">
                You used {toolSteps} step{toolSteps === 1 ? '' : 's'} (best possible: {challenge.ideal.length}) with {wrongTries} wrong tr{wrongTries === 1 ? 'y' : 'ies'}.
                {lostOriginal.length > 0 && ' Evaporation lost the water, though. To keep the water as well, scientists use distillation (next topics!).'}
              </p>
            </>
          ) : (
            <p className="text-sm">
              <b>Uh-oh, one pile still has two things mixed together.</b> Think about which property to use first, then press Try again.
            </p>
          )}
          <Button className="mt-3" variant="outline" onClick={() => start(challenge)}>
            Try again
          </Button>
        </motion.div>
      )}
    </LabFrame>
  )
}
