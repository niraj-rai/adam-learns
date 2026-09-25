import { motion } from 'motion/react'
import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { MoonDisc } from '../moon-lab/MoonDisc'
import { OrbitView } from '../moon-lab/MoonLab'
import { eclipse, phaseName } from '../moon-lab/model'
import { dayFromAngle, MISSIONS } from './model'

export default function MoonCommander() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [i, setI] = useState(0)
  const [deg, setDeg] = useState(120)
  const [onNode, setOnNode] = useState(false)
  const [hearts, setHearts] = useState(3)
  const [result, setResult] = useState<null | boolean>(null)
  const done = i >= MISSIONS.length
  const mission = MISSIONS[Math.min(i, MISSIONS.length - 1)]
  const day = dayFromAngle(deg)
  const ecl = eclipse(day, onNode ? 0 : 30)

  const check = () => {
    const ok = mission.check(deg, onNode)
    setResult(ok)
    if (ok) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setResult(null)
    if (n >= MISSIONS.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('moon-commander')) addXp(25 + hearts * 10, 'Moon Commander!')
      awardBadge('moon-commander')
    }
  }
  const restart = () => { setI(0); setHearts(3); setResult(null); setDeg(120); setOnNode(false) }

  return (
    <LabFrame labId="moon-commander" title="Boss Challenge: Moon Commander" subtitle="You control the Moon! Put it in the right place for each mission." howTo={<p>Drag the slider to move the Moon round its orbit. For eclipses, you may also need the Moon at a “node” (in line with Earth’s orbit). Press “Check” when you think you have it. A wrong answer costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Mission {Math.min(i + 1, MISSIONS.length)} / {MISSIONS.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🌕</p>
          <p className="mt-2 font-heading text-2xl font-semibold">All missions complete, Commander! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && result === null ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">Out of lives. Revisit the Moon Lab and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-muted/50 p-4 font-heading text-lg font-semibold">🚀 {mission.text}</motion.p>
          <div className="grid gap-4 md:grid-cols-[1fr_170px]">
            <OrbitView day={day} node={onNode} eclipseKind={ecl} />
            <div className="grid place-items-center gap-1 rounded-2xl border bg-slate-950 p-3">
              <MoonDisc day={day} label={`${phaseName(day)} as seen from India`} />
              <p className="text-center text-xs text-slate-300">seen from India</p>
            </div>
          </div>
          <label className="block text-sm">Moon position around its orbit: <b>{deg}°</b>
            <Slider value={[deg]} min={0} max={355} step={5} disabled={result !== null} onValueChange={([v]) => setDeg(v)} className="mt-1.5" aria-label="Moon position" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onNode} disabled={result !== null} onChange={(e) => setOnNode(e.target.checked)} className="size-4" />
            Put the Moon at a node (exactly in line with Earth’s orbital plane)
          </label>
          {result === null ? (
            <Button onClick={check}>🔭 Check</Button>
          ) : (
            <div role="status" className={cn('rounded-xl p-4 text-sm', result ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{result ? '✅ Mission accomplished! ' : `❌ Not quite: that's a ${phaseName(day).toLowerCase()}${ecl ? ` with a ${ecl} eclipse` : ''}. `}{mission.why}</p>
              {result || hearts > 0 ? (
                result ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < MISSIONS.length ? 'Next mission →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setResult(null)}>Try again</Button>
              ) : (
                <Button className="mt-3" variant="outline" onClick={() => setResult(null)}>See result</Button>
              )}
            </div>
          )}
        </div>
      )}
    </LabFrame>
  )
}
