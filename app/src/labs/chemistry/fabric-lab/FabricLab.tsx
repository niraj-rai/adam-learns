import { useMemo, useState } from 'react'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const BINS = ['🌱 From plants', '🐑 From animals', '🏭 Made in factories (synthetic)']
const FIBRES = [
  { name: 'Cotton', emoji: '☁️', bin: 0, note: 'from cotton bolls; cool for summer' },
  { name: 'Jute', emoji: '🧺', bin: 0, note: 'from jute stems; sacks and bags (West Bengal grows the most)' },
  { name: 'Wool', emoji: '🐑', bin: 1, note: 'from sheep, goats and yaks; traps air, keeps us warm' },
  { name: 'Silk', emoji: '🐛', bin: 1, note: 'from silkworm cocoons; Kanchipuram and Banaras silk are famous' },
  { name: 'Polyester', emoji: '🧥', bin: 2, note: 'made from petroleum chemicals; strong, dries fast' },
  { name: 'Nylon', emoji: '🪢', bin: 2, note: 'very strong; ropes, fishing nets, socks' },
  { name: 'Coir', emoji: '🥥', bin: 0, note: 'from coconut husks; doormats and ropes' },
]
const STEPS = ['🌿 Pick the cotton bolls', '⚙️ Ginning: separate the seeds', '🧵 Spinning: twist fibres into yarn', '🪡 Weaving or knitting: yarn into fabric', '🎨 Dyeing and printing', '👕 Cutting and stitching clothes']

export default function FabricLab() {
  const items = useMemo(() => shuffle(FIBRES), [])
  const [placed, setPlaced] = useState<Record<string, number>>({})
  const [sel, setSel] = useState<string | null>(null)
  const [shown, setShown] = useState(1)
  const put = (b: number) => {
    if (!sel) return
    const f = FIBRES.find((x) => x.name === sel)!
    setPlaced((p) => ({ ...p, [sel]: b }))
    if (f.bin === b) sfx.correct(); else sfx.wrong()
    setSel(null)
  }
  return (
    <LabFrame labId="fabric-lab" title="From Fibre to Fabric" subtitle="Clothes are made from fibres. Some come from plants, some from animals, and some are made in factories." howTo={<p>Tap a fibre, then tap where it comes from. Then follow cotton from the field to your shirt.</p>}>
      <div className="flex flex-wrap gap-2">{items.map((f) => <button key={f.name} type="button" disabled={f.name in placed} aria-pressed={sel === f.name} onClick={() => setSel(f.name)} className={cn('rounded-xl border-2 px-3 py-2 text-sm', sel === f.name ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', f.name in placed && 'opacity-40')}>{f.emoji} {f.name}</button>)}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {BINS.map((b, i) => (
          <button key={b} type="button" onClick={() => put(i)} className={cn('min-h-28 rounded-2xl border-2 border-dashed p-3 text-left', sel && 'animate-pulse')}>
            <p className="font-semibold">{b}</p>
            <ul className="mt-1 space-y-1 text-xs">{FIBRES.filter((f) => placed[f.name] === i).map((f) => <li key={f.name}>{f.bin === i ? '✅' : '❌'} {f.name}: <span className="text-muted-foreground">{f.note}</span></li>)}</ul>
          </button>
        ))}
      </div>
      <h3 className="mt-4 font-semibold">Cotton’s journey</h3>
      <ol className="mt-2 space-y-1">{STEPS.slice(0, shown).map((s, i) => <li key={s} className="rounded-lg border px-3 py-1 text-sm">{i + 1}. {s}</li>)}</ol>
      {shown < STEPS.length && <button type="button" onClick={() => setShown(shown + 1)} className="mt-2 rounded-lg border-2 px-3 py-1 text-sm hover:bg-muted">Next step ➜</button>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">India has one of the oldest cotton-weaving traditions in the world: cotton cloth has been found at Mohenjo-daro, over 4,500 years old. Mahatma Gandhi’s <b>charkha</b> (spinning wheel) turned spinning into a symbol of self-reliance.</p>
    </LabFrame>
  )
}
