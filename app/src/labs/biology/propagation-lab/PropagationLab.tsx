import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { type Method, METHOD_NAME, OTHER_ASEXUAL, PLANTS, works } from './model'

export default function PropagationLab() {
  const [pid, setPid] = useState('potato')
  const [m, setM] = useState<Method | null>(null)
  const [grown, setGrown] = useState<string[]>([])
  const p = PLANTS.find((x) => x.id === pid)!
  const ok = m ? works(pid, m) : false
  const plant = (method: Method) => {
    setM(method)
    if (works(pid, method)) { sfx.correct(); setGrown((g) => (g.includes(pid) ? g : [...g, pid])) } else sfx.wrong()
  }
  return (
    <LabFrame labId="propagation-lab" title="New Plants Without Seeds" subtitle="Many plants can grow from a piece of the parent. This is vegetative propagation, a kind of asexual reproduction." howTo={<p>Choose a plant, then choose which part to plant. Does a new plant grow? Grow all eight. Then explore other ways living things reproduce with just one parent.</p>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PLANTS.map((x) => <button key={x.id} type="button" onClick={() => { setPid(x.id); setM(null) }} className={cn('rounded-full border px-3 py-1 text-sm', x.id === pid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{grown.includes(x.id) ? '✅' : x.emoji} {x.name}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="grid h-48 place-items-end justify-center rounded-2xl border bg-amber-50 pb-3 dark:bg-stone-900">
          {m && <motion.span key={`${pid}-${m}`} initial={{ scale: 0, y: 20 }} animate={{ scale: ok ? 1 : 0.6, y: 0, opacity: ok ? 1 : 0.4 }} transition={{ type: 'spring' }} className="text-6xl">{ok ? '🌱' : '🥀'}</motion.span>}
          {!m && <span className="text-5xl">{p.emoji}</span>}
        </div>
        <div className="space-y-2">
          <p className="text-sm">Plant which part of the <b>{p.name}</b>?</p>
          <div className="flex flex-wrap gap-1.5">{(Object.keys(METHOD_NAME) as Method[]).map((k) => <Button key={k} size="sm" variant={m === k ? 'default' : 'outline'} onClick={() => plant(k)}>{METHOD_NAME[k]}</Button>)}</div>
          {m && <p role="status" className={cn('rounded-lg p-3 text-sm', ok ? 'bg-success-soft' : 'bg-warn-soft')}>{ok ? `✅ A new plant grows! ${p.note}` : `❌ That doesn't work for ${p.name.toLowerCase()}. Try another part.`}</p>}
          <Readout label="Plants grown" value={`${grown.length} / ${PLANTS.length}`} />
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {OTHER_ASEXUAL.map((o) => <div key={o.id} className="rounded-xl border p-3 text-sm"><b>{o.name}</b> <span className="text-muted-foreground">({o.example})</span><p>{o.how}</p></div>)}
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">In <b>asexual reproduction</b>, only one parent is involved, and the offspring are identical copies of it. It's quick, and farmers use it to keep good varieties the same. But the plants have no variety, so a disease that attacks one can attack them all.</p>
    </LabFrame>
  )
}
