import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { seeded } from '../particle-zoom/samples'
import { LabFrame, Readout } from '../../_kit/LabFrame'

type Sign = 'gas' | 'colour' | 'temperature' | 'solid'
const SIGNS: Record<Sign, string> = {
  gas: '💨 Gas bubbles / fizzing',
  colour: '🎨 Colour change',
  temperature: '🌡️ Temperature change',
  solid: '🧱 A solid forms (precipitate)',
}

const BEAKER = {
  vinegar: { name: 'Vinegar', color: '#fef3c7' },
  limewater: { name: 'Lime water', color: '#f8fafc' },
  cuso4: { name: 'Copper sulfate solution', color: '#38bdf8' },
  milk: { name: 'Hot milk', color: '#fffbeb' },
  turmeric: { name: 'Turmeric (haldi) water', color: '#facc15' },
  h2o2: { name: 'Hydrogen peroxide', color: '#f1f5f9' },
  water: { name: 'Water', color: '#e0f2fe' },
} as const
const ADD = {
  soda: 'Baking soda',
  chalk: 'Chalk pieces',
  breath: 'Breathe out through a straw',
  nail: 'Iron nail',
  lemon: 'Lemon juice',
  soap: 'Soap solution',
  yeast: 'Yeast',
  salt: 'Salt',
} as const

type B = keyof typeof BEAKER
type A = keyof typeof ADD
type Result = { signs: Sign[]; dT: number; after?: string; solidColor?: string; text: string; product: string }

const REACTIONS: Partial<Record<`${B}+${A}`, Result>> = {
  'vinegar+soda': { signs: ['gas', 'temperature'], dT: -3, text: 'Lots of fizzing! Carbon dioxide gas is made, and the beaker gets slightly colder.', product: 'vinegar + baking soda → sodium acetate + water + carbon dioxide' },
  'vinegar+chalk': { signs: ['gas'], dT: 0, text: 'Slow, steady bubbles rise from the chalk: carbon dioxide gas. The chalk slowly gets smaller.', product: 'vinegar + chalk (calcium carbonate) → calcium acetate + water + carbon dioxide' },
  'limewater+breath': { signs: ['solid'], dT: 0, after: '#f1f5f9', solidColor: '#ffffff', text: 'The clear lime water turns milky! Carbon dioxide in your breath makes a white solid (calcium carbonate). This is THE test for carbon dioxide.', product: 'lime water + carbon dioxide → calcium carbonate (milky) + water' },
  'cuso4+nail': { signs: ['colour', 'solid'], dT: 0, after: '#86efac', solidColor: '#b45309', text: 'Over time the blue solution turns pale green, and a reddish-brown coating of copper forms on the nail. Iron has pushed copper out of the solution.', product: 'iron + copper sulfate → iron sulfate (green) + copper (brown)' },
  'milk+lemon': { signs: ['solid'], dT: 0, after: '#fef9c3', solidColor: '#fefce8', text: 'The milk curdles into white lumps and a watery liquid (whey). That is how paneer is made!', product: 'milk proteins + acid → curdled solid (paneer) + whey' },
  'turmeric+soap': { signs: ['colour'], dT: 0, after: '#dc2626', text: 'Yellow turmeric water turns red! Soap is a base, and turmeric is a natural indicator. (Wash the red stain with lemon juice and it turns yellow again.)', product: 'turmeric (yellow) + base → red colour' },
  'h2o2+yeast': { signs: ['gas', 'temperature'], dT: 8, text: 'A tower of foam rushes up and the beaker gets warm! Yeast speeds up the breakdown of hydrogen peroxide into water and oxygen gas.', product: 'hydrogen peroxide → water + oxygen' },
  'vinegar+lemon': { signs: [], dT: 0, text: 'No visible change. The two liquids just mix.', product: 'no reaction (just mixing)' },
  'water+salt': { signs: [], dT: 0, text: 'The salt dissolves and disappears, but there are no signs of a new substance. Dissolving is a physical change.', product: 'no reaction (dissolving is physical)' },
}

export default function ReactionBench() {
  const [beaker, setBeaker] = useState<B>('vinegar')
  const [add, setAdd] = useState<A>('soda')
  const [mixed, setMixed] = useState<Result | null>(null)
  const [ticks, setTicks] = useState<Sign[]>([])
  const [checked, setChecked] = useState(false)
  const [found, setFound] = useState<string[]>([])

  const bubbles = useMemo(() => {
    const r = seeded(11)
    return Array.from({ length: 24 }, () => ({ x: 60 + r() * 80, d: 0.8 + r() * 1.2, delay: r() * 1.5, s: 2 + r() * 3 }))
  }, [])

  const key = `${beaker}+${add}` as const
  const mix = () => {
    const r = REACTIONS[key] ?? { signs: [], dT: 0, text: 'No visible change. Either nothing happens, or it is too slow to notice.', product: 'no visible reaction' }
    setMixed(r)
    setTicks([])
    setChecked(false)
    sfx.click()
  }
  const reset = () => {
    setMixed(null)
    setTicks([])
    setChecked(false)
  }

  const right = mixed && checked && mixed.signs.length === ticks.length && mixed.signs.every((s) => ticks.includes(s))
  const color = mixed?.after ?? BEAKER[beaker].color
  const T = 25 + (mixed?.dT ?? 0)

  return (
    <LabFrame
      labId="reaction-bench"
      title="Reaction Bench"
      subtitle="Mix substances and look for the signs of a chemical reaction"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Choose what is in the beaker and what to add, then press <b>Mix</b>.</li>
          <li>Record every sign you observe, then check your observations.</li>
          <li>Find all 7 reactions! Some combinations do nothing. That is a useful result too.</li>
        </ul>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold">In the beaker</span>
              <select value={beaker} onChange={(e) => { setBeaker(e.target.value as B); reset() }} className="mt-1 block w-full rounded-lg border bg-background px-3 py-2">
                {Object.entries(BEAKER).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-semibold">Add</span>
              <select value={add} onChange={(e) => { setAdd(e.target.value as A); reset() }} className="mt-1 block w-full rounded-lg border bg-background px-3 py-2">
                {Object.entries(ADD).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <svg viewBox="0 0 200 190" className="mx-auto w-full max-w-xs" role="img" aria-label={mixed ? mixed.text : `${BEAKER[beaker].name} in a beaker`}>
            <motion.rect x={52} y={70} width={96} height={100} rx={6} animate={{ fill: color }} transition={{ duration: 2 }} opacity={0.85} />
            {mixed?.signs.includes('gas') &&
              bubbles.map((b, i) => (
                <motion.circle key={i} cx={b.x} r={b.s} fill="#fff" stroke="#94a3b8" strokeWidth={0.6} initial={{ cy: 168, opacity: 0 }} animate={{ cy: [168, 72], opacity: [0, 1, 0] }} transition={{ duration: b.d, delay: b.delay, repeat: Infinity }} />
              ))}
            {mixed?.signs.includes('gas') && key === 'h2o2+yeast' && <motion.rect x={52} width={96} rx={20} fill="#f8fafc" stroke="#cbd5e1" initial={{ y: 70, height: 0 }} animate={{ y: 8, height: 64 }} transition={{ duration: 1.5 }} />}
            {mixed?.solidColor &&
              Array.from({ length: 30 }, (_, i) => (
                <motion.circle key={i} cx={58 + ((i * 37) % 84)} r={2.4} fill={mixed.solidColor} stroke="#a8a29e" strokeWidth={0.4} initial={{ cy: 90 + ((i * 23) % 60), opacity: 0 }} animate={{ cy: 162 - (i % 4) * 3, opacity: 1 }} transition={{ duration: 2, delay: i * 0.03 }} />
              ))}
            {add === 'nail' && <rect x={96} y={40} width={8} height={115} rx={2} fill={mixed ? '#92400e' : '#6b7280'} />}
            <path d="M50 30 V168 a6 6 0 0 0 6 6 H144 a6 6 0 0 0 6 -6 V30" fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={3} />
          </svg>

          <div className="flex gap-2">
            <Button size="lg" onClick={mix}>🧪 Mix</Button>
            <Button size="lg" variant="ghost" onClick={reset}>Clean the beaker</Button>
          </div>
        </div>

        <div className="space-y-3">
          <Readout label="Temperature" value={`${T} °C`} />
          <div className="rounded-xl border bg-background p-3">
            <p className="mb-2 text-sm font-semibold">My observations</p>
            <div className="space-y-1.5">
              {(Object.keys(SIGNS) as Sign[]).map((s) => (
                <label key={s} className={cn('flex items-center gap-2 text-sm', checked && mixed?.signs.includes(s) && 'font-semibold text-success')}>
                  <input type="checkbox" className="size-4" disabled={!mixed || checked} checked={ticks.includes(s)} onChange={() => setTicks((t) => (t.includes(s) ? t.filter((x) => x !== s) : [...t, s]))} />
                  {SIGNS[s]}
                </label>
              ))}
            </div>
            <Button
              className="mt-3 w-full"
              variant="outline"
              disabled={!mixed || checked}
              onClick={() => {
                setChecked(true)
                const ok = mixed!.signs.length === ticks.length && mixed!.signs.every((s) => ticks.includes(s))
                ;(ok ? sfx.correct : sfx.wrong)()
                if (mixed!.signs.length && !found.includes(key)) setFound((f) => [...f, key])
              }}
            >
              Check observations
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">Reactions found: <b className="text-foreground">{found.length}</b> / 7</p>
        </div>
      </div>

      {mixed && checked && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('mt-4 rounded-xl border p-4 text-sm', right ? 'border-success/50 bg-success-soft' : 'bg-warn-soft')}>
          <p className="font-semibold">{right ? '✅ Great observing!' : '🔍 Look again:'} {mixed.text}</p>
          <p className="mt-1 text-muted-foreground">
            <b>{mixed.signs.length ? 'Chemical change.' : 'No chemical change.'}</b> Word equation: {mixed.product}
          </p>
        </motion.div>
      )}
    </LabFrame>
  )
}
