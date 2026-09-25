import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CHALLENGES, checkChain, DEVICES, FORM_LABEL, isSolved } from './model'

export default function EnergyChain() {
  const addXp = useProgress((s) => s.addXp)
  const [ci, setCi] = useState(0)
  const [chain, setChain] = useState<string[]>([])
  const [solved, setSolved] = useState<string[]>([])
  const c = CHALLENGES[ci]
  const r = checkChain(c.start.form, chain)
  const win = isSolved(c, chain)

  const add = (id: string) => {
    const next = [...chain, id]
    setChain(next)
    const check = checkChain(c.start.form, next)
    if (!check.ok) return sfx.wrong()
    if (isSolved(c, next)) {
      sfx.win()
      if (!solved.includes(c.id)) {
        setSolved((s) => [...s, c.id])
        addXp(10, `Energy chain: ${c.title}`)
      }
    } else sfx.click()
  }
  const pick = (i: number) => { setCi(i); setChain([]) }

  return (
    <LabFrame labId="energy-chain" title="Energy Chain" subtitle="Energy is never made or destroyed. It just changes form. Build the chain!" howTo={<p>Start from the energy source. Add devices one at a time: each device must take in the form of energy the previous one gave out. Reach the goal to solve the challenge.</p>}>
      {win && <Confetti count={40} />}
      <div className="mb-3 flex flex-wrap gap-2">
        {CHALLENGES.map((x, i) => (
          <button key={x.id} type="button" onClick={() => pick(i)} className={cn('rounded-full border px-3 py-1.5 text-sm', i === ci ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {solved.includes(x.id) ? '✅ ' : ''}{x.title}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm"><b>Goal:</b> {c.goalText}.</p>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-3" aria-live="polite">
        <Node emoji={c.start.emoji} name={c.start.name} />
        <AnimatePresence initial={false}>
          {chain.map((id, i) => {
            const d = DEVICES.find((x) => x.id === id)!
            const broken = r.brokenAt === i
            return (
              <motion.div key={`${id}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Arrow form={i === 0 ? c.start.form : DEVICES.find((x) => x.id === chain[i - 1])!.output} bad={broken} />
                <Node emoji={d.emoji} name={d.name} bad={broken} />
              </motion.div>
            )
          })}
        </AnimatePresence>
        {r.ok && chain.length > 0 && <Arrow form={r.output} />}
        {r.ok && chain.length === 0 && <Arrow form={c.start.form} />}
      </div>

      {r.brokenAt !== null && (
        <p role="status" className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-sm">❌ The {DEVICES.find((x) => x.id === chain[r.brokenAt!])!.name.toLowerCase()} needs <b>{FORM_LABEL[DEVICES.find((x) => x.id === chain[r.brokenAt!])!.input].name.toLowerCase()}</b> energy, but it's getting <b>{FORM_LABEL[r.output].name.toLowerCase()}</b> energy. Undo and try another device.</p>
      )}
      {win && (
        <p role="status" className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-sm">✅ Chain complete! Only about <b>{(r.useful * 100).toFixed(r.useful < 0.01 ? 2 : 0)}%</b> of the starting energy ends up as the useful output. The rest wasn't destroyed: it spread out as <b>heat</b> (and some sound) at every step.</p>
      )}

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setChain((ch) => ch.slice(0, -1))} disabled={!chain.length}>↩ Undo</Button>
        <Button variant="ghost" size="sm" onClick={() => setChain([])}>Clear</Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEVICES.map((d) => (
            <button key={d.id} type="button" disabled={r.brokenAt !== null || win} onClick={() => add(d.id)} className="rounded-xl border bg-background p-2 text-left text-xs hover:border-chem disabled:opacity-50">
              <span className="text-lg">{d.emoji}</span> <b>{d.name}</b>
              <span className="block text-muted-foreground">{FORM_LABEL[d.input].emoji} {FORM_LABEL[d.input].name} → {FORM_LABEL[d.output].emoji} {FORM_LABEL[d.output].name}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Readout label="Energy form right now" value={`${FORM_LABEL[r.output].emoji} ${FORM_LABEL[r.output].name}`} />
          <Readout label="Useful energy left (of 100 J)" value={`${(r.useful * 100).toFixed(r.useful < 0.1 ? 1 : 0)} J`} />
          <Readout label="Challenges solved" value={`${solved.length} / ${CHALLENGES.length}`} />
        </div>
      </div>
    </LabFrame>
  )
}

function Node({ emoji, name, bad }: { emoji: string; name: string; bad?: boolean }) {
  return (
    <div className={cn('flex min-w-20 flex-col items-center rounded-xl border px-2 py-1 text-center text-xs', bad ? 'border-destructive bg-destructive/10' : 'bg-muted/40')}>
      <span className="text-2xl">{emoji}</span>
      <span className="max-w-24 leading-tight">{name}</span>
    </div>
  )
}

function Arrow({ form, bad }: { form: keyof typeof FORM_LABEL; bad?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center text-[10px]', bad ? 'text-destructive' : 'text-muted-foreground')}>
      <span>{FORM_LABEL[form].emoji}</span>
      <span className="text-lg leading-none">→</span>
      <span className="max-w-16 text-center leading-tight">{FORM_LABEL[form].name}</span>
    </div>
  )
}
