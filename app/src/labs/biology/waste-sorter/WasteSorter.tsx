import { useMemo, useState } from 'react'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const ITEMS = [
  { name: 'Banana peel', emoji: '🍌', bio: true, time: '2–5 weeks' },
  { name: 'Newspaper', emoji: '📰', bio: true, time: '2–6 weeks' },
  { name: 'Cotton cloth', emoji: '👕', bio: true, time: '1–5 months' },
  { name: 'Leaves', emoji: '🍂', bio: true, time: '1–3 months' },
  { name: 'Plastic bottle', emoji: '🧴', bio: false, time: '450+ years' },
  { name: 'Polythene bag', emoji: '🛍️', bio: false, time: '10–1000 years' },
  { name: 'Glass jar', emoji: '🫙', bio: false, time: '1 million years' },
  { name: 'Aluminium can', emoji: '🥫', bio: false, time: '80–200 years' },
  { name: 'Vegetable scraps', emoji: '🥬', bio: true, time: '1–2 months' },
  { name: 'Styrofoam cup', emoji: '🥤', bio: false, time: 'Hundreds of years' },
]
const RS = [
  { r: 'Reduce', emoji: '📉', text: 'Use less: carry a cloth bag, refuse straws, switch off lights.' },
  { r: 'Reuse', emoji: '🔁', text: 'Use things again: refill bottles, reuse jars and envelopes.' },
  { r: 'Recycle', emoji: '♻️', text: 'Separate dry waste so paper, glass, metal and some plastics can be remade.' },
]

export default function WasteSorter() {
  const items = useMemo(() => shuffle(ITEMS), [])
  const [placed, setPlaced] = useState<Record<string, boolean>>({})
  const [sel, setSel] = useState<string | null>(null)
  const put = (bin: boolean) => {
    if (!sel) return
    const it = ITEMS.find((x) => x.name === sel)!
    setPlaced((p) => ({ ...p, [sel]: bin }))
    if (it.bio === bin) sfx.correct(); else sfx.wrong()
    setSel(null)
  }
  const done = Object.keys(placed).length
  const right = ITEMS.filter((x) => placed[x.name] === x.bio).length
  return (
    <LabFrame labId="waste-sorter" title="Waste Sorter" subtitle="Biodegradable waste is broken down by microbes. Non-biodegradable waste stays for years, so we must reduce, reuse and recycle it." howTo={<p>Tap an item, then tap the bin it belongs in: wet (biodegradable) or dry (non-biodegradable). See how long each takes to break down.</p>}>
      <div className="flex flex-wrap gap-2">{items.map((x) => <button key={x.name} type="button" disabled={x.name in placed} aria-pressed={sel === x.name} onClick={() => setSel(x.name)} className={cn('rounded-xl border-2 px-3 py-2 text-sm', sel === x.name ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', x.name in placed && 'opacity-40')}>{x.emoji} {x.name}</button>)}</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[true, false].map((bin) => (
          <button key={String(bin)} type="button" onClick={() => put(bin)} className={cn('min-h-32 rounded-2xl border-4 border-dashed p-3 text-left', bin ? 'border-green-500/60' : 'border-sky-500/60', sel && 'animate-pulse')}>
            <p className="font-semibold">{bin ? '🟢 Wet waste: biodegradable' : '🔵 Dry waste: non-biodegradable'}</p>
            <ul className="mt-2 space-y-1 text-xs">{ITEMS.filter((x) => placed[x.name] === bin).map((x) => <li key={x.name}>{x.bio === bin ? '✅' : '❌'} {x.emoji} {x.name} <span className="text-muted-foreground">({x.time})</span></li>)}</ul>
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm">Sorted {done} of {ITEMS.length} · correct {right}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{RS.map((r) => <div key={r.r} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{r.emoji} {r.r}</p><p className="text-xs text-muted-foreground">{r.text}</p></div>)}</div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Indian cities ask households to separate <b>wet</b> (kitchen) waste for composting and <b>dry</b> waste for recycling. Burning plastics releases toxic gases. The <b>ozone layer</b> high in the atmosphere shields us from ultraviolet rays; CFCs once used in fridges damaged it, so they were banned by the Montreal Protocol (1987), and the layer is slowly recovering.</p>
    </LabFrame>
  )
}
