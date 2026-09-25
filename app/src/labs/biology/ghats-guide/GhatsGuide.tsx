import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { KEY, type KeyNode, SPECIMENS } from './model'

export default function GhatsGuide() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(SPECIMENS), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [node, setNode] = useState<KeyNode | string>(KEY)
  const [path, setPath] = useState<string[]>([])
  const [hearts, setHearts] = useState(3)
  const [result, setResult] = useState<null | boolean>(null)
  const done = i >= order.length
  const s = order[Math.min(i, order.length - 1)]

  const answer = (yes: boolean) => {
    if (typeof node === 'string') return
    const n = yes ? node.yes : node.no
    setPath((p) => [...p, `${node.q} ${yes ? 'Yes' : 'No'}`])
    setNode(n)
    if (typeof n === 'string') {
      const ok = n === s.id
      setResult(ok)
      if (ok) sfx.correct()
      else { sfx.wrong(); setHearts((h) => h - 1) }
    }
  }
  const retry = () => { setNode(KEY); setPath([]); setResult(null) }
  const next = () => {
    const n = i + 1
    setI(n)
    retry()
    if (n >= order.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('field-naturalist')) addXp(25 + hearts * 10, 'Field Naturalist!')
      awardBadge('field-naturalist')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); retry() }
  const reached = typeof node === 'string' ? SPECIMENS.find((x) => x.id === node)! : null

  return (
    <LabFrame labId="ghats-guide" title="Boss Challenge: Western Ghats Field Guide" subtitle="You're a naturalist in one of the world's biodiversity hotspots. Identify eight organisms using a key." howTo={<p>Read the field notes about each organism. Answer each question in the key honestly, based on the notes. The key will lead you to a name. A wrong identification costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Specimen {Math.min(i + 1, order.length)} / {order.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🔭</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Field guide complete! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <p className="text-sm">The Western Ghats are home to thousands of species found nowhere else on Earth, and they are a UNESCO World Heritage Site.</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && result === null ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">Out of lives. Read each clue carefully and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm font-semibold">📓 Field notes: specimen #{i + 1}</p>
            <p className="text-[15px]">{s.clue}</p>
          </div>
          {path.length > 0 && <ol className="space-y-0.5 text-xs text-muted-foreground">{path.map((p, k) => <li key={k}>{k + 1}. {p}</li>)}</ol>}
          {typeof node !== 'string' ? (
            <div className="rounded-2xl border-2 border-chem p-4">
              <p className="font-heading text-lg font-semibold">❓ {node.q}</p>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => answer(true)}>Yes</Button>
                <Button variant="outline" onClick={() => answer(false)}>No</Button>
              </div>
            </div>
          ) : (
            <div role="status" className={cn('rounded-xl p-4 text-sm', result ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p className="font-heading text-lg font-semibold">{reached!.emoji} {reached!.name}</p>
              <p>{result ? `✅ Correct! ${reached!.fact}` : '❌ The key led somewhere that doesn’t match the field notes. Check which answer was wrong.'}</p>
              {result ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < order.length ? 'Next specimen →' : 'Finish'}</Button> : hearts > 0 ? <Button className="mt-3" variant="outline" onClick={retry}>Try the key again</Button> : <Button className="mt-3" variant="outline" onClick={() => setResult(null)}>See result</Button>}
            </div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
